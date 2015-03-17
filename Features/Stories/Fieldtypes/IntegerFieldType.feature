Feature: Test the validations done on fields from PlatformUI - Integer fieldtype

    @javascript
    Scenario Outline: Validate IntegerEditView when exiting the field using valid data
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Integer" in Group with identifier "Content" with fields:
            | identifier | Type      | Name    |
            | name       | ezstring  | Name    |
            | integer    | ezinteger | Integer |
        And I create a content of content type "Integer" with:
            | Name   | Integer   |
            | <name> | <integer> |
        When I click on the actionbar action "Publish"
        Then I should see an element 'Integer' with value "<integer>"

        Examples:
            | name         | integer |
            | integerTest1 | 3       |
            | integerTest2 | 0       |
            | integerTest3 | -1      |

    @javascript
    Scenario Outline: Validate IntegerEditView when exiting the field using valid data
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Integer" in Group with identifier "Content" with fields:
            | identifier | Type      | Name    |
            | name       | ezstring  | Name    |
            | integer    | ezinteger | Integer |
        And I create a content of content type "Integer" with:
            | Name   | Integer   |
            | <name> | <integer> |
        When I click on the actionbar action "Publish"
        Then I should see "The value should be a valid integer number" text

        Examples:
            | name         | integer |
            | integerTest1 | 3.0     |
            | integerTest2 | 0.5     |
            | integerTest3 | abc     |

    @javascript
    Scenario Outline: Validate integerEditView when integer between limitation
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Integer2" in Group with identifier "Content" with fields:
            | identifier | Type      | Name    | validator        |
            | name       | ezstring  | Name    | false            |
            | integer    | ezinteger | Integer | IntegerValue:1~3 |
        And I create a content of content type "Integer2" with:
            | Name   | Integer   |
            | <name> | <integer> |
        When I click on the actionbar action "Publish"
        Then I should see an element 'Integer' with value "<integer>"

        Examples:
            | name         | integer |
            | integerTest1 | 1       |
            | integerTest2 | 2       |
            | integerTest3 | 3       |

    @javascript
    Scenario Outline: Validate integerEditView when integer outside limitation
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Integer2" in Group with identifier "Content" with fields:
            | identifier | Type      | Name    | validator        |
            | name       | ezstring  | Name    | false            |
            | integer    | ezinteger | Integer | IntegerValue:1~3 |
        And I create a content of content type "Integer2" with:
            | Name   | Integer   |
            | <name> | <integer> |
        When I click on the actionbar action "Publish"
        Then I should see <errorMessage> text

        Examples:
            | name         | integer | errorMessage                                  |
            | integerTest1 | 0       | "The value should be more than or equal to 1" |
            | integerTest2 | 4       | "The value should be less than or equal to 3" |
