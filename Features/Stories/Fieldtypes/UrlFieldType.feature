Feature: Test the validations done on fields from PlatformUI - URL fieldtype

    @javascript
    Scenario Outline: Fill one Url field with valid url
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "URL" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | url        | ezurl    | URL  |
        And I create a content of content type "Url" with:
            | Name    |
            | <title> |
        And I fill in "URL:" subform with:
            | URL:      | Text:     |
            | www.ez.no | ezsystems |
        When I click on the actionbar action "Publish"
        Then I should see the following links:
            | links     |
            | ezsystems |

        Examples:
            | title      | URL       | Text      | links     |
            | "URLTest1" | www.ez.no | ezsystems | ezsystems |
            | "URLTest2" | www.ez.no |           | www.ez.no |

    @javascript
    Scenario: No javascript error when displaying a content with an empty Url field
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "URL" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | url        | ezurl    | URL  |
        And I create a content of content type "Url" with:
            | Name      |
            | "URLTest" |
        And I fill in "URL:" subform with:
            | URL: | Text: |
            |      |       |
        When I click on the actionbar action "Publish"
        Then I should see an element 'URL' with value 'This field is empty'

    @javascript
    Scenario:
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "URL" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | url        | ezurl    | URL  |
        And I click on the navigation zone "Platform"
        And I click on the "Content structure" link
        And I click on the actionbar action "Create a content"
        And I click on the content type "Url"
        And I fill in "Name" with "UrlTest"
        And I fill in "URL:" subform with:
            | URL:       | Text: |
            | www.ez .no |       |
        When I click on the actionbar action "Publish"
        Then I should see "Invalid link" text
