Feature: Test the validations done on fields from Editorial Interface - Date fieldtype

    @javascript
    Scenario Outline: Create a content with a valid date
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Date" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | date       | ezdate   | Date |
        And I create a content of content type "Date" with:
            | Name    | Date   |
            | <title> | <date> |
        When I click on the actionbar action "Publish"
        Then I should see <title> title
        And I should see an element 'Date' with value "<showDate>"

        Examples:
            | title     | date       | showDate   |
            | dateTest1 | 2015-01-01 | 01/01/2015 |
            | dateTest2 | 2012-02-29 | 29/02/2012 |
            | dateTest3 | 1911-01-01 | 01/01/1911 |
            | dateTest4 | 1938-01-01 | 01/01/1938 |

    @javascript
    Scenario: Create a content with an empty date
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Date" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | date       | ezdate   | Date |
        And I create a content of content type "Date" with:
            | Name     | Date |
            | dateTest |      |
        When I click on the actionbar action "Publish"
        Then I should see "dateTest" title
        And I should see an element 'Date' with value "This field is empty"

    @javascript
    Scenario Outline: Create content with invalid dates
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Date" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | date       | ezdate   | Date |
        And I create a content of content type "Date" with:
            | Name    | Date   |
            | <title> | <date> |
        When I click on the actionbar action "Publish"
        Then I should see "This is not a correct date" text

        Examples:
            | title      | date        |
            | dateTest1  | 2013-01-32  |
            | dateTest2  | 2013-02-29  |
            | dateTest3  | 2013-01--01 |
            | dateTest4  | 2013-01-1.1 |
            | dateTest5  | 2013-13-01  |
            | dateTest6  | 2013--01-01 |
            | dateTest7  | 2013-1.1-01 |
            | dateTest8  | 1969-01-01  |
            | dateTest9  | -2013-01-01 |
            | dateTest10 | 20.13-01-01 |
            | dateTest11 | aaaa-01-01  |
            | dateTest12 | 2013-aa-01  |
            | dateTest13 | 2013-01-aa  |
