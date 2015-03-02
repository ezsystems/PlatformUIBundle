Feature: Edit Date, Date and Time, and Time fields

    @javascript
    Scenario: As an editor, I want to be able to fill a valid date
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Date" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | date       | ezdate   | Date |
        And there is a content "Date" of type "Date" at "/" with fields:
        """
        title
        ===
        Date Test

        date
        ===
        26-01-2015
        """
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Content tree"
        And I click on the "Date Test" link
        And I click on the side menu option "Edit"
        And I fill in "Date" with "2015-01-31"
        When I click on the side menu option "Publish"
        Then I should see an element 'Date' with value '31/01/2015'

    @javascript
    Scenario: As an editor, I want to be unable to fill an invalid date
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Date" in Group with identifier "Content" with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | date       | ezdate   | Date |
	    And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Date"
        And I fill in "Name" with "DateTest"
        When I fill in "Date" with "2015-02-30"
        And I click on the side menu option "Publish"
        Then I should see "This is not a correct date" text

    @javascript
    Scenario: As an editor, I want to be able to fill a valid date and time
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Date and Time" in Group with identifier "Content" with fields:
            | identifier | Type       | Name          |
            | title      | ezstring   | Name          |
            | dateTime   | ezdatetime | Date and Time |
       And I click on the menu zone "Create"
       And I click on the "Content structure" link
       And I click on the side menu option "Create a content"
       And I click on the content type "Date and Time"
       And I fill in "Name" with "DateTimeTest"
       When I fill in "Date and Time" with "2015-02-15 18:00"
       And I click on the side menu option "Publish"
       Then I should see "DateTimeTest" title
       And I should see an element 'Date' with value '15/02/2015 18:00'

    @javascript
    Scenario: As an editor, I shouldn't be able to fill a invalid date and time
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier "Date and Time" in Group with identifier "Content" with fields:
            | identifier | Type       | Name          |
            | title      | ezstring   | Name          |
            | dateTime   | ezdatetime | Date and Time |
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Date and Time"
        And I fill in "Name" with "DateTimeTest"
        When I fill in "Date and Time" with "2015-22-49 27:80"
        And I click on the side menu option "Publish"
        Then I should see "This is not a correct date" text

    @javascript
    Scenario: As an editor, I want to be able to fill a valid time
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier Time in Group with identifier Content with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | time       | eztime   | Time |
        And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Time"
        And I fill in "Name" with "TimeTest"
        And I fill in "Time" with "18:00"
        When I click on the side menu option "Publish"
	    Then I should see an element "Time" with value "18:00"

    @javascript
    Scenario: As an editor, I want to be able to fill an invalid timie
        Given I go to PlatformUI app with username "admin" and password "publish"
        And a Content Type exists with identifier Time in Group with identifier Content with fields:
            | identifier | Type     | Name |
            | title      | ezstring | Name |
            | time       | eztime   | Time |
	    And I click on the menu zone "Create"
        And I click on the "Content structure" link
        And I click on the side menu option "Create a content"
        And I click on the content type "Time"
        And I fill in "Name" with "TimeTest"
        And I fill in "Time" with "25:00"
        When I click on the side menu option "Publish"
        Then I should see "This time is invalid" text
