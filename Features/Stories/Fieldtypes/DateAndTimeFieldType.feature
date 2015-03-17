Feature: Test the validations done on fields from Editorial Interface - DateTimeTime fieldtype

    @javascript @javascript
    Scenario Outline: Create a content with a valid dateTime
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "DateTime" in Group with identifier "Content" with fields:
            | identifier | Type       | Name     |
            | title      | ezstring   | Name     |
            | dateTime   | ezdateTime | DateTime |
        And I create a content of content type "DateTime" with
            | title   | dateTime   |
            | <title> | <dateTime> |
        When I click on the actionbar action "Publish"
        Then I should see <title> title
        And I should see an element 'DateTime' with value "<dateTime>"

        Examples:
            | title         | dateTime         |
            | dateTimeTest1 | 2015-01-01 00:00 |
            | dateTimeTest1 | 2011-01-01 00:00 |
            | dateTimeTest1 | 2038-01-01 00:00 |
            | dateTimeTest2 | 2012-02-29 12:12 |
            | dateTimeTest4 | 00:00            |
            | dateTimeTest5 | 2012-02-29       |

    @javascript
    Scenario: Create a content with an empty dateTime
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "DateTime" in Group with identifier "Content" with fields:
            | identifier | Type       | Name     |
            | title      | ezstring   | Name     |
            | dateTime   | ezdateTime | DateTime |
        And I create a content of content type "DateTime" with
            | title      | dateTime |
            | "dateTime" |          |
        When I click on the actionbar action "Publish"
        Then I should see "dateTime" title
        And I should see an element 'Time' with value "This field is empty"

    @javascript
    Scenario Outline: Create content with invalid dateTimes
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "DateTime" in Group with identifier "Content" with fields:
            | identifier | Type       | Name     |
            | title      | ezstring   | Name     |
            | dateTime   | ezdateTime | DateTime |
        And I create a content of content type "DateTime" with
            | title   | dateTime   |
            | <title> | <dateTime> |
        When I click on the actionbar action "Publish"
        Then I should see "This is not a correct dateTime" text

        Examples:
            | title          | dateTime             |
            | dateTimeTest1  | 2013-01-32 00:00     |
            | dateTimeTest2  | 2013-02-29 00:00     |
            | dateTimeTest3  | 2013-01--01 00:00    |
            | dateTimeTest4  | 2013-01-1.1 00:00    |
            | dateTimeTest5  | 2013-13-01 00:00     |
            | dateTimeTest6  | 2013--01-01 00:00    |
            | dateTimeTest7  | 2013-1.1-01 00:00    |
            | dateTimeTest8  | 1969-01-01 00:00     |
            | dateTimeTest9  | -2013-01-01 00:00    |
            | dateTimeTest10 | 20.13-01-01 00:00    |
            | dateTimeTest11 | aaaa-01-01 00:00     |
            | dateTimeTest12 | 2013-aa-01 00:00     |
            | dateTimeTest13 | 2013-01-aa 00:00     |
            | dateTimeTest14 | 2015-01-01 00:00:00  |
            | dateTimeTest15 | 2015-01-01 abcd      |
            | dateTimeTest16 | 2015-01-01 25:00     |
            | dateTimeTest17 | 2015-01-01 12:60     |
            | dateTimeTest19 | 2015-01-01 -12:12    |
            | dateTimeTest20 | 2015-01-01 12:-12:12 |

    @javascript
    Scenario Outline: Create a content with a valid dateTime with seconds
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "DateTime" in Group with identifier "Content" with fields:
            | identifier | Type       | Name     | Validtor         |
            | title      | ezstring   | Name     | false            |
            | dateTime   | ezdateTime | DateTime | Useseconds: true |
        And I create a content of content type "DateTime" with
            | title   | dateTime   |
            | <title> | <dateTime> |
        When I click on the actionbar action "Publish"
        Then I should see <title> title
        And I should see an element 'DateTime' with value "<dateTime>"

        Examples:
            | title         | dateTime            |
            | dateTimeTest1 | 2015-01-01 00:00:00 |
            | dateTimeTest2 | 2012-02-29 12:12:12 |
            | dateTimeTest3 | 1969-01-01 12:12:12 |
            | dateTimeTest4 | 00:00:00            |

    @javascript
    Scenario Outline: Create content with invalid dateTimes
        Given I am logged in as admin on PlatformUI
        And a Content Type exists with identifier "DateTime" in Group with identifier "Content" with fields:
            | identifier | Type       | Name     | Validtor         |
            | title      | ezstring   | Name     | false            |
            | dateTime   | ezdateTime | DateTime | Useseconds: true |
        And I create a content of content type "DateTime" with
            | title   | dateTime   |
            | <title> | <dateTime> |
        When I click on the actionbar action "Publish"
        Then I should see "This is not a correct dateTime" text

        Examples:
            | title          | dateTime             |
            | dateTimeTest1  | 2013-01-32 00:00:00  |
            | dateTimeTest2  | 2013-02-29 00:00:00  |
            | dateTimeTest3  | 2013-01--01 00:00:00 |
            | dateTimeTest4  | 2013-01-1.1 00:00:00 |
            | dateTimeTest5  | 2013-13-01 00:00:00  |
            | dateTimeTest6  | 2013--01-01 00:00:00 |
            | dateTimeTest7  | 2013-1.1-01 00:00:00 |
            | dateTimeTest8  | 1969-01-01 00:00:00  |
            | dateTimeTest9  | -2013-01-01 00:00:00 |
            | dateTimeTest10 | 20.13-01-01 00:00:00 |
            | dateTimeTest11 | aaaa-01-01 00:00:00  |
            | dateTimeTest12 | 2013-aa-01 00:00:00  |
            | dateTimeTest13 | 2013-01-aa 00:00:00  |
            | dateTimeTest15 | 2015-01-01 abcd      |
            | dateTimeTest16 | 2015-01-01 24:00     |
            | dateTimeTest17 | 2015-01-01 25:00:00  |
            | dateTimeTest18 | 2015-01-01 12:60:00  |
            | dateTimeTest19 | 2015-01-01 12:12:60  |
            | dateTimeTest20 | 2015-01-01 -12:12:12 |
            | dateTimeTest21 | 2015-01-01 12:-12:12 |
            | dateTimeTest22 | 2015-01-01 12:12:-12 |
