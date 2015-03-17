Feature: Test the validations done on fields from Editorial Interface - Time fieldtype

    @javascript
    Scenario Outline: Create a content with a valid time without seconds
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Time" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | time       | eztime   | Time |
        And I create a content of content type "Time" with:
            | Name    | Time   |
            | <title> | <time> |
        When I click on the actionbar action "Publish"
        Then I should see <title> title
        And I should see an element 'Time' with value "<time>"

        Examples:
            | title     | time  |
            | timeTest1 | 00:00 |
            | timeTest2 | 12:00 |

    @javascript
    Scenario: Create a content with an empty time
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Time" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | time       | eztime   | Time |
        And I create a content of content type "Time" with:
            | Name       | Time |
            | "timeTest" |      |
        When I click on the actionbar action "Publish"
        Then I should see "timeTest" title
        And I should see an element 'Time' with value "This field is empty"

    @javascript
    Scenario Outline: Create a content with a valid time with seconds
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Time" in Group with identifier "Content" with fields:
            | identifier | Type     | Name | Settings        |
            | Name       | ezstring | Name | false           |
            | time       | eztime   | Time | useSeconds:true |
        And I create a content of content type "Time" with:
            | Name    | Time   |
            | <title> | <time> |
        When I click on the actionbar action "Publish"
        Then I should see <title> title
        And I should see an element 'Time' with value "<time>"

        Examples:
            | title     | time     |
            | timeTest1 | 00:00:00 |
            | timeTest2 | 12:00:59 |

    @javascript
    Scenario Outline: Validate invalid time without seconds
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Time" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | time       | eztime   | Time |
        And I create a content of content type "Time" with:
            | Name    | Time   |
            | <title> | <time> |
        When I click on the actionbar action "Publish"
        Then I should see "This time is invalid, enter a correct time: HH:MM(:SS)" text

        Examples:
            | title     | time      |
            | timeTest1 | 00:00:00  |
            | timeTest2 | abcd      |
            | timeTest3 | 25:00     |
            | timeTest4 | 12:60     |
            | timeTest5 | -12:12    |
            | timeTest6 | 12:-12:12 |

    @javascript
    Scenario Outline: Validate invalid time with seconds
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "Time" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | time       | eztime   | Time |
        And I create a content of content type "Time" with:
            | Name    | Time   |
            | <title> | <time> |
        When I click on the actionbar action "Publish"
        Then I should see "This time is invalid, enter a correct time: HH:MM(:SS)" text

        Examples:
            | title     | time      |
            | timeTest1 | abcd      |
            | timeTest2 | 25:00:00  |
            | timeTest3 | 12:60:00  |
            | timeTest4 | 12:12:60  |
            | timeTest5 | -12:12:12 |
            | timeTest6 | 12:-12:12 |
            | timeTest7 | 12:12:-12 |
