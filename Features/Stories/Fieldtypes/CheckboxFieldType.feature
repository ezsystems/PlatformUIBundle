Feature: Test the validations done on fields from Editorial Interface - Checkbox fieldtype

    @javascript
    Scenario: Publish with checkbox checked
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Checkbox" in Group with identifier "Content" with fields:
            | identifier | Type      | Name     |
            | name       | ezstring  | Name     |
            | checkbox   | ezboolean | Checkbox |
        And I create a content of content type "Checkbox" with:
            | Name      |
            | CheckTest |
        And I checked "Checkbox" checkbox
        When I click on the actionbar action "Publish"
        Then I should see "CheckTest" title
        And I should see an element "Checkbox" with value "Yes"

    @javascript
    Scenario: Publish with checkbox unchecked
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Checkbox" in Group with identifier "Content" with fields:
            | identifier | Type      | Name     |
            | name       | ezstring  | Name     |
            | float      | ezboolean | Checkbox |
        And I create a content of content type "Checkbox" with:
            | Name      |
            | CheckTest |
        When I click on the actionbar action "Publish"
        Then I should see "CheckTest" title
        And I should see an element "Checkbox" with value "No"
