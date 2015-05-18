Feature: Test the validations done on fields from PlatformUI - Time fieldtype
    In order to validateAndTime the dateAndTime fieldtype
    As an Editor  user
    I need to be able to create, updateAndTime and delete content with dateAndTime fieldtypes

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # ValidateAndTime the existence of expected fields from a field type when creating a content
    ##
    @javascript
    Scenario: A Content of a Content Type that has a dateAndTime fieldtype must have a dateAndTime field
        Given a Content Type with a "dateAndTime" Field exists
        When I create a content of this type
        Then I should see a "dateAndTime" field

    @javascript
    Scenario: When editing a Content the label of a dateAndTime field must have the same name than field type from the respective Content Type
        Given a Content Type with a "dateAndTime" with "Name" "Arriving schedule" exists
        When I create a content of this type
        Then I should see a "Arriving schedule:" label related with the "dateAndTime" field

    @javascript
    Scenario: The label of an mandatory dateAndTime field of a Content must be marked as mandatory
        Given a Content Type with a "required" "dateAndTime" with "Name" "Arriving schedule" exists
        When I create a content of this type
        Then the "Arriving schedule" field should be marked as mandatory

    ##
    # Creating Content using a Content Type that has a Time Field Type
    ##
    @javascript
    Scenario: Publishing a valid dateAndTime Field works
        Given a Content Type with a "dateAndTime" Field exists
        When I create a content of this Type
        And I set "2015/01/01 - 10:10" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing a valid Field dateAndTime with mandatory seconds works
        Given a Content Type with a "dateAndTime" Field exists with Properties:
            | Validator   | Value |
            | Use Seconds | Yes   |
        When I create a content of this type
        And I set "2015/01/01 - 10:10:10" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: The dateAndTime field of a Content of a Content Type that has a Time field with a default dateAndTime set to current dateAndTime, should present the current dateAndTime
        Given a Content Type with a "dateAndTime" Field exists with Properties:
            | Validator     | Value               |
            | Default value | Current dateAndTime |
        When I create a content of this type
        Then I should see a field with value "NOW_DATETIME_WITHOUT_SECONDS"

    @javascript
    Scenario: The dateAndTime field of a Content of a Content Type that has a Time field with a default dateAndTime set to current dateAndTime, should present the current dateAndTime
        Given a Content Type with a "dateAndTime" Field exists with Properties:
            | Validator     | Value               |
            | Default value | Current dateAndTime |
            | Use Seconds   | Yes                 |
        When I create a content of this type
        Then I should see a field with value "NOW_DATETIME_WITH_SECONDS"

    @javascript
    Scenario: Publishing an invalid dateAndTime Field fails validation when using an incorrect date
        Given a Content Type with a "dateAndTime" Field exists
        When I create a content of this Type
        And I set "2015/05/32 - 10:10" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "Please enter a valid date"

    @javascript
    Scenario: Publishing an invalid dateAndTime Field fails validation when using an incorrect time
        Given a Content Type with a "dateAndTime" Field exists
        When I create a content of this Type
        And I set "2015/05/01 - 25:10" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "Please enter a valid time"

    @javascript
    Scenario: Publishing an invalid dateAndTime Field fails validation if not using seconds when it's mandatory to use seconds
        Given a Content Type with a "dateAndTime" Field exists with Properties:
            | Validator   | Value |
            | Use Seconds | Yes   |
        When I create a content of this Type
        And I set "2015/05/01 - 10:10" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "Please enter a valid time"

    @javascript
    Scenario: Publishing a required dateAndTime Field fails validation when using an empty value
        Given a Content Type with a "required" "dateAndTime" exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Update Content using a Content Type that has a Time Field Type
    ##
    @javascript
    Scenario: Updating a valid dateAndTime Field works
        Given a Content Type with a "dateAndTime" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "2015/01/01 - 11:11" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating a valid Field dateAndTime with mandatory seconds works
        Given a Content Type with a "dateAndTime" Field exists with Properties:
            | Validator   | Value |
            | Use Seconds | Yes   |
        And a Content of this type exists
        When I edit this content
        And I set "2015/01/01 - 11:11:11" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating an invalid dateAndTime Field fails validation when using an incorrect date
        Given a Content Type with a "dateAndTime" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "2015/05/32 - 10:10" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "Please enter a valid date"

    @javascript
    Scenario: Updating an invalid dateAndTime Field fails validation when using an incorrect time
        Given a Content Type with a "dateAndTime" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "2015/05/01 - 25:10" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "Please enter a valid time"

    @javascript
    Scenario: Updating an invalid dateAndTime Field fails validation if not using seconds when it's mandatory to use seconds
        Given a Content Type with a "dateAndTime" Field exists with Properties:
            | Validator   | Value |
            | Use Seconds | Yes   |
        And a Content of this type exists
        When I edit this content
        And I set "2015/05/01 - 11:11" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "Please enter a valid time"

    @javascript
    Scenario: Updating a required dateAndTime Field fails validation when using an empty value
        Given a Content Type with a "dateAndTime" Field exists
        And a Content of this type exists
        When I edit this content
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Delete Content using a Content Type that has a Time Field Type
    ##
    @javascript
    Scenario: Deleting a content that has a dateAndTime field
        Given a Content Type with a "dateAndTime" Field exists
        And a Content of this type exists
        When I delete this Content
        Then the Content is successfully deleted

    ##
    # Viewing content that has a dateAndTime fieldtype
    ##
    @javascript
    Scenario: Viewing a Content that has a dateAndTime fieldtype should show the expected value
        Given a Content Type with a "dateAndTime" Field exists
        And a Content of this type exists with "dateAndTime" Field Value set to "2015/05/01 - 10:10"
        When I view this Content
        Then I should see a field with value "2015/05/01 - 10:10"

    @javascript
    Scenario: Viewing a Content that has a dateAndTime fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with a "dateAndTime" Field exists
        And a Content of this type exists with "dateAndTime" Field Value set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"
