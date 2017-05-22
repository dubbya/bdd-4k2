var xpath = require('xpath'),
	dom = require('xmldom').DOMParser,
	doc = null,
	activeframe = null

module.exports = function () {

	var getViewControllerDef = function () {
		//used to get the ID from the K2 XML, using the control name, both on parent and in iframe
		var result = browser.execute(function () {
			// browser context - you may not access client or console
			return viewControllerDefinition.xml;
		});
		doc = new dom().parseFromString(result.value)
	}

	var iframeExists = function () {
		// wait for no ajaxLoaders
		const elements = browser.elements(".ajaxLoader")
		for (const elem of elements.value) {
			if (elem.isVisible()) {
				elem.waitForVisible(15000, true)
			}
		}
		if (browser.isExisting('iframe[class="content-control-iframe"]') || browser.isExisting('iframe[class="runtime-popup"]')) {
			return true
		}
		return false
	}

	var iframeSwitchTo = function () {
		browser.frame()	//return to the root frame

		var doSwitch = function (classname) {
			//console.log('Switching to iframe: ' + classname)
			var myframe = browser.element('iframe[class="' + classname + '"]')
			browser.frame(myframe.value)
			activeframe = classname
			// wait for no ajaxLoaders
			const elements = browser.elements(".ajaxLoader")
			for (const elem of elements.value) {
				//console.log(elem.isVisible())
				if (elem.isVisible()) {
					elem.waitForVisible(15000, true)
				}
			} 
		}

		if (browser.isExisting('iframe[class="content-control-iframe"]')) doSwitch("content-control-iframe")

		if (browser.isExisting('iframe[class="runtime-popup"]')) doSwitch("runtime-popup")

		//getViewControllerDef()  //this was firing too early and getting the wrong controllers XML
	}

		var iframeSwitchBack = function () {
			browser.frame()
			//refresh the xmldoc with the parent viewcontrollerdefinition
			getViewControllerDef()
		}

	this.Before(function () {
		console.log("**************************************************************************");
	})

	this.Given(/^I have opened "([^"]*)"$/, function (url) {
		browser.url(url);
	})

	//currently written for AAD and K2 forms login
	this.Given(/^I have logged in as "([^"]*)" with "([^"]*)"$/, function (un, pwd) {
		this.doFormsLogin = function () {
			var e = browser.element('[id="UserName"]')
			e.click()
			browser.keys(un)

			e = browser.element('[id="Password"]')
			e.click()

			browser.keys(pwd)
			browser.keys(['Enter'])
		}

		//Azure Active Directory
		if (browser.isExisting("[id='login_workload_logo_text']")) {
			var e = browser.element('[id="cred_userid_inputtext"]')
			e.click()
			browser.keys(un)

			e = browser.element('[id="cred_password_inputtext"]')
			e.click()
			browser.pause(1000)
			browser.keys(pwd)

			browser.keys(['Enter'])
		}
		//K2 forms authentication
		else if (browser.isExisting("[id='UsernameField']")) {
			this.doFormsLogin()
		}
		//multiAuth: Note this relies on the forms STS including the word "Forms" in it
		else if (browser.isExisting('[id="SignInPanel"]')) {
			var e = browser.element('span=Select Login Method')
			e.click()	//open the select box
			browser.waitForExist('[id="SignInPanel_droplist"]', 15000)

			e = browser.element('[id="SignInPanel_droplist"]')
			e = e.element('span*=Forms')
			e.click()

			browser.waitForExist('[id="UsernameField"]', 15000)
			this.doFormsLogin()
		}
		else {
			console.log('Already logged in')
		}

		//get the K2 view control definitions
		browser.waitForExist(".ajaxLoader", 15000, true)
		getViewControllerDef()
	})

	this.Given(/^I search for "([^"]*)" in "([^"]*)"$/, function (txt, viewname) {
		browser.waitForVisible("[data-sf-title='" + viewname + "']")

		var view = browser.element("[data-sf-title='" + viewname + "']")
		var parent = view.element('//..').element('//..').element('//..').element('//..')
		var quicksearch = parent.element("[id*='_quickSearchTxt']")

		quicksearch.click()
		quicksearch.keys(txt)
		browser.keys(['Enter'])
	})

	//ensures a view loads with a certain title and ajaxLoader is finished
	this.Given(/^I see view "([^"]*)"$/, function (viewname) {
		const elements = browser.elements(".ajaxLoader")
		for (const elem of elements.value) {
			if (elem.isVisible()) {
				elem.waitForVisible(15000, true)
			}
		}
		browser.pause(1000)

		var str = "span=" + viewname
		if (iframeExists()) {
			//will switch to an iframe if finds content control or popupmanager
			iframeSwitchTo()
		}

		browser.waitForVisible(str, 15000)
	});

	this.Given(/^I see "([^"]*)"$/, function (title) {
		browser.waitForExist("div=" + title, 15000)
	})

	this.When(/^I click "([^"]*)"$/, function (txt) {
		var e, id 
		//browser.pause(15000)    //TODO: improve this with a waitForExist gone on the list view ajax call or something OR waitforexists on popupmanager but handling the timeout correctly
		getViewControllerDef()

		var getElement = function () {
			id = (xpath.select1("//Control[@Name='" + txt + "']/@ID", doc) != null) ? xpath.select1("//Control[@Name='" + txt + "']/@ID", doc).value : null

			//console.log('click id= ' + id)	//was coming through as null with wrong xml due to timing issues

			if (browser.isExisting("//*[. = '" + txt + "']")) {
				console.log("found by exact element text")
				const elements = browser.elements("//*[. = '" + txt + "']")
				for (const elem of elements.value) {
					if (elem.isVisible()) {
						e = elem
						break
					}
				}
			} else if (browser.isExisting("//*[contains(text(), '" + txt + "')]")) {
				console.log("found by xpath")
				const elements = browser.elements("//*[contains(text(), '" + txt + "')]")
				for (const elem of elements.value) {
					if (elem.isVisible()) {
						e = elem
						break
					}
				}
			} else if (id != null && browser.isExisting('[id*="' + id + '"]')) {
				console.log("found by xml id")
				e = browser.element('[id*="' + id + '"]')
			}
		}

		getElement()

		// if we still dont have an element try top frame
		if (e == null) {
			iframeSwitchBack()
			getElement()
		}

		e.click()
		//iframeSwitchBack()
	})

	//picker, date fields, textbox
	this.When(/^I type "([^"]*)" in "([^"]*)"$/, function (txt, name) {
		var e, id

		var getElement = function () {
			if (doc) {
				id = (xpath.select1("//Control[@Name='" + name + "']/@ID", doc) != null) ? xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value : null
				//console.log(id)
				if (browser.isExisting("[id*='" + id + "']")) {
					e = browser.element("[id*='" + id + "']")
				}
			}
		}

		getElement()

		//if (e == null) {
		//	iframeSwitchTo()
		//	getElement()
		//}

		if (e == null) {
			//fallback to searching for named element if no XML exists
			var searchbox = browser.element('[name=' + name + ']')
			browser.keys(txt)
			browser.keys(['Enter'])
		} else {
			//watermark is not consistent in all controls, so this finds the parent and then searches down
			var parent = e.element('//..')

			if (parent.isExisting('.input-control-watermark'))
				parent.click('.input-control-watermark')
			else
				e.click()     //this is for textboxes as the watermark is on the same control

			// handle a "Now" keyword for dynamic date
			if (txt.toLowerCase() == "now") {
				var today = new Date()
				var dd = today.getDate()
				var mm = today.getMonth() + 1 	//Jan is 0
				var yyyy = today.getFullYear()
				if (dd < 10) dd = '0' + dd
				if (mm < 10) mm = '0' + mm
				var txt = dd + '/' + mm + '/' + yyyy
			}
			browser.keys(txt)
			browser.keys(['Enter'])
		}

		//iframeSwitchBack()
	})

	//radio button
	//TODO:eventually merge this with the choice radio button lists function
	this.When(/^I select "([^"]*)"$/, function (name) {
		var id = (xpath.select1("//Control[@Name='" + name + "']/@ID", doc) != null) ? xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value : null
		var e = "div[id*='" + id + "']"
		browser.waitForExist(e, 15000)
		browser.click(e);
	})

	//dropdowns and radio button choice lists
	this.When(/^I select "([^"]*)" in "([^"]*)"$/, function (val, name) {
		var e, ctrtype, id

		getViewControllerDef()

		var getElement = function () {
			id = (xpath.select1("//Control[@Name='" + name + "']/@ID", doc) != null) ? xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value : null
			//console.log(id)

			if (browser.isExisting("[id='" + id + "_MultiSelectPanel']")) {
				//its a radio list
				e = browser.element("[id='" + id + "_MultiSelectPanel']")
				ctrtype = 'multiselectpanel'
			} else if (id != null && browser.isExisting("div[id='" + id + "']")) {
				//its a dropdown
				e = browser.element("div[id='" + id + "']")
				ctrtype = 'dropdown'
			}
		}

		getElement()

		//if (e == null) {
		//	iframeSwitchTo()
		//	getElement()
		//}

		if (ctrtype == 'multiselectpanel') {
			e.click("[title='" + val + "']")
		} else if (ctrtype == 'dropdown') {
			e.click()
			var li = "li[title='" + val + "']"
			var droplist = "[id='" + id + "_droplist']"

			browser.element(droplist).waitForVisible(li, 15000)
			browser.element(droplist).click(li)
		} else {
			// TODO make this an assert to ensure the control exists
			console.error('didnt find a dropdown or multiselect panel???')
		}
		//iframeSwitchBack()
	})

	//submit button
	this.When(/^I submit the form$/, function () {
		var e = "a=Submit"
		browser.click(e)
	})

	this.Then(/^view "([^"]*)" is "([^"]*)"$/, function (name, state) {
		browser.waitForExist('[name="' + name + '"]');
		const cssClass = browser.getAttribute('[name="' + name + '"]', "class");
		expect(cssClass).toContain(state);
	})

	this.Then(/^"([^"]*)" is populated with "([^"]*)"$/, function (name, txt) {
		var id = xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value
		var e = "[id*='" + id + "']"
		var result = browser.waitForText(e)
		var text = browser.getText(e)
		expect(text).toEqual(txt)
	});

	this.Then(/^I see confirmation "([^"]*)"$/, function (txt) {
		browser.waitForVisible('.popupManager',15000)
		const popup = browser.element(".popupManager")
		const text = popup.getText('div=' + txt)
		expect(text).toContain(txt)
	})

	this.Then(/^control "([^"]*)" is "([^"]*)"$/, function (name, visibility) {
		var id = (xpath.select1("//Control[@Name='" + name + "']/@ID", doc) != null) ? xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value : null
		var e = "[id='" + id + "']"
		//console.log(browser.isVisible(e)) //an array will complicate things so need ID to be correct
		var isVisible = browser.isVisible(e)
		if (visibility == "hidden")
			expect(isVisible).toBeFalsy();
		else
			expect(isVisible).toBeTruthy();
	})

	this.Then(/^I click row "([^"]*)" in "([^"]*)"$/, function (rowno, name) {
		//dont use the viewControllerDefinition as need to find the list view itself
		var e = "[name='" + name + "']"
		var v = browser.element(e)
		//console.log(browser.isVisible(e))

		var tbody = v.element(".grid-content-table tbody")
		const elements = tbody.elements("tr");
		const element = elements.value[rowno - 1];

		//click the rowno
		element.click()
	})

	this.Then(/^I pass data to row "([^"]*)" in "([^"]*)"$/, function (rowno, name, table) {
		const data = table.raw();

		//console.log(data)

		for (var d in data) {				//each row object
			for (var i in data[d]) {		//each item in row
				browser.pause(500)
				var cell = data[d][i]
				//console.log(cell)			
				if (cell != "") browser.keys(cell)
				browser.keys(['Tab'])
			}
		}
	})

}
