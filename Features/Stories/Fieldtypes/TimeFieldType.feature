Feature: Test the validations done on fields from PlatformUI - Time fieldtype
    In order to valitime the time fieldtype
    As an Editor  user
    I need to be able to create, uptime and delete content with time fieldtypes

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # Valitime the existence of expected fields from a field type when creating a content
    ##
    @javascript
    Scenario: A Content of a Content Type that has a time fieldtype must have a time field
        Given a Content Type with a "time" Field exists
        When I create a content of this type
        Then I should see a "time" field

    @javascript
    Scenario: When editing a Content the label of a time field must have the same name than field type from the respective Content Type
        Given a Content Type with a "time" with "Name" "Arriving Time" exists
        When I create a content of this type
        Then I should see a "Arriving Time:" label related with the "time" field

    @javascript
    Scenario: The label of an mandatory time field of a Content must be marked as mandatory
        Given a Content Type with a "required" "time" with "Name" "Arriving Time" exists
        When I create a content of this type
        Then the "Arriving Time" field should be marked as mandatory

    ##
    # Creating Content using a Content Type that has a Time Field Type
    ##
    @javascript
    Scenario: Publishing a valid time Field works
        Given a Content Type with a "time" Field exists
        When I create a content of this Type
        And I set "10:10" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing a valid Field time with mandatory seconds works
        Given a Content Type with a "time" Field exists with Properties:
            | Validator   | Value |
            | Use Seconds | Yes   |
        When I create a content of this type
        And I set "10:10:10" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: The time field of a Content of a Content Type that has a Time field with a default time set to current time, should present the current time
        Given a Content Type with a "time" Field exists with Properties:
            | Validator     | Value        |
            | Default value | Current time |
        When I create a content of this type
        Then I should see a field with value "NOW_TIME_WITHOUT_SECONDS"

    @javascript
    Scenario: The time field of a Content of a Content Type that has a Time field with a default time set to current time, should present the current time
        Given a Content Type with a "time" Field exists with Properties:
            | Validator     | Value        |
            | Default value | Current time |
            | Use Seconds   | Yes          |
        When I create a content of this type
        Then I should see a field with value "NOW_TIME_WITH_SECONDS"

    @javascript
    Scenario: Publishing an invalid time Field fails validation when using an inccorect time
        Given a Content Type with a "time" Field exists
        When I create a content of this Type
        And I set "25:10" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This time is invalid, enter a correct time: HH:MM(:SS)"

    @javascript
    Scenario: Publishing an invalid time Field fails validation when using an inccorect time when it's mandatory to use seconds
        Given a Content Type with a "time" Field exists with Properties:
            | Validator   | Value |
            | Use Seconds | Yes   |
        When I create a content of this Type
        And I set "13:10" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This time is invalid, enter a correct time: HH:MM(:SS)"

    @javascript
    Scenario: Publishing a required time Field fails validation when using an empty value
        Given a Content Type with a "required" "time" exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Update Content using a Content Type that has a Time Field Type
    ##
    @javascript
    Scenario: Updating a time field using a valid time Field works
        Given a Content Type with a "time" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "11:11" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating a Field time with mandatory seconds works when using a valid time with seconds
        Given a Content Type with a "time" Field exists with Properties:
            | Validator   | Value |
            | Use Seconds | Yes   |
        And a Content of this type exists
        When I edit this content
        And I set "11:11:11" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating a Field time fails validation when not using seconds when it's mandatory to use seconds
        Given a Content Type with a "time" Field exists with Properties:
            | Validator   | Value |
            | Use Seconds | Yes   |
        And a Content of this type exists
        When I edit this content
        And I set "11:11" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This time is invalid, enter a correct time: HH:MM(:SS)"

    @javascript
    Scenario: Updating a required time Field fails validation when using an empty value
        Given a Content Type with a "required" "time" exists
        And a Content of this type exists
        When I edit this content
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Delete Content using a Content Type that has a Time Field Type
    ##
    @javascript
    Scenario: Deleting a content that has a time field
        Given a Content Type with a "time" Field exists
        And a Content of this type exists
        When I delete this Content
        Then the Content is successfully deleted

    ##
    # Viewing content that has a time fieldtype
    ##
    @javascript
    Scenario: Viewing a Content that has a time fieldtype should show the expected value
        Given a Content Type with a "time" Field exists
        And a Content of this type exists with "time" Field Value set to "10:10"
        When I view this Content
        Then I should see a field with value "10:10"

    @javascript
    Scenario: Viewing a Content that has a time fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with a "time" Field exists
        And a Content of this type exists with "time" Field Value set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"
