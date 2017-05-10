var xpath = require('xpath'),
	dom = require('xmldom').DOMParser,
	doc

module.exports = function () {

	this.Before(function () {
		console.log("**************************************************************************");
	})

	this.Given(/^I have opened "([^"]*)"$/, function (url) {
		browser.url(url);
	})

	//currently written for AAD and K2 forms login
	this.Given(/^I have logged in as "([^"]*)" with "([^"]*)"$/, function (un, pwd) {
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
			var e = browser.element('[id="UserName"]')
			e.click()
			browser.keys(un)

			e = browser.element('[id="Password"]')
			e.click()
			//browser.pause(1000)
			browser.keys(pwd)

			browser.keys(['Enter'])
		}
		else {
			console.log('Already logged in')
		}

		//get the K2 view control definitions
		browser.waitForExist(".ajaxLoader", 5000, true)
		var result = browser.execute(function () {
			// browser context - you may not access client or console
			return viewControllerDefinition.xml;
		});
		doc = new dom().parseFromString(result.value)
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
		var e = "span=" + viewname
		//console.log(e)
		browser.waitForExist(e, 5000)
		browser.waitForExist(".ajaxLoader", 5000, true)		//wait for ajax to disappear
	});

	this.Given(/^I see "([^"]*)"$/, function (title) {
		browser.waitForExist("div=" + title, 5000)
	})

	this.Then(/^I click "([^"]*)"$/, function (txt) {
		browser.pause(1000)    //TODO: improve this with a waitForExist gone on the list view ajax call or something OR waitforexists on popupmanager but handling the timeout correctly
		var e;
		var exist = browser.isExisting(".popupManager")
		console.log("Info: Popup Manager Exists: " + exist)
		if (exist) {
			var popup = browser.element(".popupManager")
			e = popup.element("=" + txt)		//note this only selects <a>
		} else {
			browser.waitForExist("//*[contains(text(), '" + txt + "')]", 5000);
			e = browser.element("//*[contains(text(), '" + txt + "')]")
		}
		//console.log(e)
		e.click()
	})

	//picker, date fields, textbox
	this.When(/^I type "([^"]*)" in "([^"]*)"$/, function (txt, name) {
		if (doc) {
			var id = xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value
			var e = "[id*='" + id + "']"
			browser.waitForExist(e, 5000);
			//watermark is not consistent in all controls, so this finds the parent and then searches down
			var parent = browser.element(e).element('//..')

			if (parent.isExisting('.input-control-watermark'))
				parent.click('.input-control-watermark')
			else
				browser.click(e)     //this is for textboxes as the watermark is on the same control

			// handle a "Now" keyword for dynamic date
			if (txt.toLowerCase() == "now") {
				var today = new Date();
				var dd = today.getDate();
				var mm = today.getMonth() + 1; 	//Jan is 0
				var yyyy = today.getFullYear();
				if (dd < 10) dd = '0' + dd;
				if (mm < 10) mm = '0' + mm;
				var txt = dd + '/' + mm + '/' + yyyy;
			}
			browser.keys(txt)
			browser.keys(['Enter'])
		} else {
			//fallback to searching for named element if no XML exists
			var searchbox = browser.element('[name='+name+']')
			browser.keys(txt)
			browser.keys(['Enter'])
		}
	})

	//radio old
	/*	this.When(/^I select old "([^"]*)"$/, function (title) {
			browser.waitForExist(".ajaxLoader", 5000, true)
			var e = "[title='" + title + "']"
			browser.waitForExist(e, 5000)
			browser.click(e);
		})*/

	//radio button
	//TODO:eventually merge this with the choice radio button lists function
	this.When(/^I select "([^"]*)"$/, function (name) {
		var id = xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value
		var e = "div[id*='" + id + "']"
		browser.waitForExist(e, 5000)
		browser.click(e);
	})

	//dropdowns and radio button choice lists
	this.When(/^I select "([^"]*)" in "([^"]*)"$/, function (val, name) {
		var id = xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value
		var e = "div[id*='" + id + "']"
		//console.log(browser.getHTML(e))

		var rbl = browser.isExisting("[id='" + id + "_MultiSelectPanel']")

		if (rbl) {													//its a radio list (radio button is just the ID) so just click the title
			var rblcontrol = browser.element("[id='" + id + "_MultiSelectPanel']")
			rblcontrol.click("[title='" + val + "']");
		} else {													//its a dropdown
			var e = "div[id='" + id + "']"
			//click the dropdown control
			browser.click(e);

			var li = "li[title='" + val + "']"
			var droplist = "[id='" + id + "_droplist']"

			//click the dropdown's list item
			browser.element(droplist).waitForVisible(li, 5000);
			browser.element(droplist).click(li);
		}
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
		browser.waitForExist('div=Form Submitted')
		var text = browser.getText('div=Form Submitted')
		expect(text).toContain(txt);
	})

	this.Then(/^control "([^"]*)" is "([^"]*)"$/, function (name, visibility) {
		var id = xpath.select1("//Control[@Name='" + name + "']/@ID", doc).value
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
		console.log(browser.isVisible(e))

		var tbody = v.element(".grid-content-table tbody")
		const elements = tbody.elements("tr");
		const element = elements.value[rowno - 1];

		//click the rowno
		element.click()
	})

	this.Then(/^I pass data to row "([^"]*)" in "([^"]*)"$/, function (rowno, name, table) {
		const data = table.raw();

		console.log(data)

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