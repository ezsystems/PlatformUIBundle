Feature: Test the validations done on fields from Editorial Interface - Float fieldtype

    @javascript
    Scenario Outline: Validate use of invalid floats
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Float" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  |
            | name       | ezstring | Name  |
            | float      | ezfloat  | Float |
        And I create a content of content type "Float" with:
            | Name   | Float   |
            | <name> | <float> |
        When I click on the actionbar action "Publish"
        Then I should see "The value should be a valid float number" text
        Examples:
            | name      | float    |
            | floatTest | failtest |

    @javascript
    Scenario Outline: Use of valid floats
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Float" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  |
            | Name       | ezstring | Name  |
            | float      | ezfloat  | Float |
        And I create a content of content type "Float" with:
            | Name   | Float   |
            | <name> | <float> |
        When I click on the actionbar action "Publish"
        Then I should see <name> title
        And I should see an element 'Float' with value "<float>"
        Examples:
            | name       | float |
            | floatTest1 | 1,2   |
            | floatTest2 | 1     |
            | floatTest3 | 0     |
            | floatTest4 | -1    |
            | floatTest5 | -1,2  |

    @javascript
    Scenario: Validate required float field
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Float2" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  | required |
            | name       | ezstring | Name  | false    |
            | float      | ezfloat  | Float | true     |
        And I create a content of content type "Float2" with:
            | Name      | Float |
            | FloatTest |       |
        And I fill in "Name" with "FloatTest"
        When I click on the actionbar action "Publish"
        Then I should see "This field is required" text

    @javascript
    Scenario Outline: Float field outside of maximum and minimum permited values
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Float3" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  | validator          |
            | name       | ezstring | Name  | false              |
            | float      | ezfloat  | Float | FloatValue:2.0~3.1 |
        When I create a content of content type "Float3" with:
            | Name      | Float   |
            | FloatTest | <float> |
        Then I should see <errorMessage> text
        Examples:
            | float | errorMessage                                    |
            | 1.9   | "The value should be more than or equal to 2"   |
            | 3.5   | "The value should be less than or equal to 3.1" |

    @javascript
    Scenario Outline: Float field within maximum and minimum permited values
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Float3" in Group with identifier "Content" with fields:
            | identifier | Type     | Name  | validator          |
            | name       | ezstring | Name  | false              |
            | float      | ezfloat  | Float | FloatValue:2.0~3.1 |
        And I create a content of content type "Float3" with:
            | Name   | Float   |
            | <name> | <float> |
        When I click on the actionbar action "Publish"
        Then I should see "FloatTest" title
        And I should see an element 'Float' with value "<float>""
        Examples:
            | name       | float |
            | flostTest1 | 2.5   |
            | flostTest2 | 1.9   |
            | flostTest3 | 3.5   |
