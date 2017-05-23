var xpath = require('xpath'),
	dom = require('xmldom').DOMParser,
	doc = null,
	activeframe = null,
	defaultwait = 30000

module.exports = function () {

	var getViewControllerDef = function () {
		//used to get the ID from the K2 XML, using the control name, both on parent and in iframe
		var result = browser.execute(function () {
			// browser context - you may not access client or console
			return viewControllerDefinition.xml;
		});
		doc = new dom().parseFromString(result.value)
		console.log(xpath.select1("//Controllers/@FormID", doc).value)
	}

	var iframeSwitchTo = function () {
		// wait for no ajaxLoaders
		try {
			const elements = browser.elements(".ajaxLoader")
			for (const elem of elements.value) {
				if (elem.isVisible()) {
					elem.waitForVisible(defaultwait, true)
				}
			}
		} catch (err) {
			console.log('silently handling no ajaxLoader err: ' + err)
		}

		//return to the root frame otherwise wont find the iframes
		browser.frame()

		var doSwitch = function (classname) {
			console.log('Switching to iframe: ' + classname)
			var myframe = browser.element('iframe[class="' + classname + '"]')
			browser.frame(myframe.value)
			activeframe = classname
			// wait for no ajaxLoaders
			const elements = browser.elements(".ajaxLoader")
			for (const elem of elements.value) {
				//console.log(elem.isVisible())
				if (elem.isVisible()) {
					elem.waitForVisible(defaultwait, true)
				}
			}
		}

		if (browser.isExisting('iframe[class="content-control-iframe"]')) doSwitch("content-control-iframe")

		if (browser.isExisting('iframe[class="runtime-popup"]')) doSwitch("runtime-popup")
	}

	var iframeSwitchBack = function () {
		browser.frame()
		activeframe = null
		//refresh the xmldoc with the parent viewcontrollerdefinition
		getViewControllerDef()
	}

	var findElementByXml = function (name) {
		getViewControllerDef()

		var id = (xpath.select1("//Control[@Name='" + name + "']/@ID", doc) != null) ? xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value : null
		console.log('id from xml: ' + id)

		if (id != null && browser.isExisting('[id*="' + id + '"]')) {
			console.log("found by xml id")
			return browser.element('[id*="' + id + '"]')
		} else {
			return null
		}
	}

	var getElement = function (name) {
		var e = findElementByXml(name)

		if (!e) {
			if (browser.isExisting("//*[. = '" + name + "']")) {
				console.log("found by exact element text")
				const elements = browser.elements("//*[. = '" + name + "']")
				for (const elem of elements.value) {
					if (elem.isVisible()) {
						return elem
					}
				}
			} else if (browser.isExisting("//*[contains(text(), '" + name + "')]")) {
				console.log("found by contains text using xpath")
				const elements = browser.elements("//*[contains(text(), '" + name + "')]")
				for (const elem of elements.value) {
					if (elem.isVisible()) {
						return elem
					}
				}
			} else {
				return null
			}
		} else {
			return e
		}
	}

	this.Before(function () {
		console.log("**************************************************************************");
	})

	this.Given(/^I have opened "([^"]*)"$/, function (url) {
		browser.url(url);
	})

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
			browser.waitForExist('[id="SignInPanel_droplist"]', defaultwait)

			e = browser.element('[id="SignInPanel_droplist"]')
			e = e.element('span*=Forms')
			e.click()

			browser.waitForExist('[id="UsernameField"]', defaultwait)
			this.doFormsLogin()
		}
		else {
			console.log('Already logged in')
		}

		//get the K2 view control definitions
		browser.waitForExist(".ajaxLoader", defaultwait, true)
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

	this.Given(/^I see view "([^"]*)"$/, function (viewname) {
		var str = "span=" + viewname

		//will switch to an iframe if finds content control or popupmanager otherwise search main frame
		iframeSwitchTo()

		browser.waitForVisible(str, defaultwait)
	});

	this.Given(/^I see "([^"]*)"$/, function (title) {
		browser.waitForExist("div=" + title, defaultwait)
	})

	this.When(/^I click "([^"]*)"$/, function (name) {
		var e = null

		e = getElement(name)

		if (e == null) {   			// if we still dont have an element try top frame
			iframeSwitchBack()
			e = getElement(name)
		}

		e.click()
	})

	//picker, date fields, textbox
	this.When(/^I type "([^"]*)" in "([^"]*)"$/, function (txt, name) {
		var e = null

		e = getElement(name)

		if (e == null) {   			// if we still dont have an element try top frame
			iframeSwitchBack()
			e = getElement(name)
		}

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
	})

	//radio button //TODO deprecate
	this.When(/^I select "([^"]*)"$/, function (name) {
		//TODO:eventually merge this with the choice radio button lists function
		var id = (xpath.select1("//Control[@Name='" + name + "']/@ID", doc) != null) ? xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value : null
		var e = "div[id*='" + id + "']"
		browser.waitForExist(e, defaultwait)
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

			browser.element(droplist).waitForVisible(li, defaultwait)
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
		browser.waitForVisible('.popupManager', defaultwait)
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
