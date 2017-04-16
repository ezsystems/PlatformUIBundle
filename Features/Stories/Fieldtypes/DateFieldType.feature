Feature: Test the validations done on fields from PlatformUI - Date fieldtype
    In order to validate the date fieldtype
    As an Editor  user
    I need to be able to create, update and delete content with date fieldtypes

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    @javascript
    Scenario: A Content of a Content Type that has a date fieldtype must have a date field
        Given a Content Type with a "date" Field exists
        When I create a content of this type
        Then I should see a "date" field

    @javascript
    Scenario: When editing a Content the label of a date field must have the same name than field type from the respective Content Type
        Given a Content Type with a "date" with "Name" "Birthdate" exists
        When I create a content of this type
        Then I should see a "Birthdate:" label related with the "date" field

    @javascript
    Scenario: The label of an mandatory date field of a Content must be marked as mandatory
        Given a Content Type with a "required" "date" with "Name" "Birthdate" exists
        When I create a content of this type
        Then the "Birthdate" field should be marked as mandatory

    ##
    # Creating Content using a Content Type that has a Date Field Type
    ##
    @javascript
    Scenario: Publishing a valid date Field works
        Given a Content Type with a "date" Field exists
        When I create a content of this Type
        And I set "2015/05/01" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: The date field of a Content of a Content Type that has a Date field with a default date set to current date, should present the current date
        Given a Content Type with a "date" Field exists with Properties:
            | Validator     | Value        |
            | Default value | Current date |
        When I create a content of this type
        Then I should see a field with value "TODAYS_DATE"

    @javascript
    Scenario: Publishing an invalid date Field fails validation when using an inccorect date
        Given a Content Type with a "date" Field exists
        When I create a content of this Type
        And I set "2015/05/32" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This is not a correct date"

    @javascript
    Scenario: Publishing a required date Field fails validation when using an empty value
        Given a Content Type with a "required" "date" exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Update Content using a Content Type that has a Date Field Type
    ##
    @javascript
    Scenario: Updating a date field using a valid date Field works
        Given a Content Type with a "date" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "2015/12/31" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating a date Field fails validation when using an invalid date
        Given a Content Type with a "date" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "2015/05/32" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This is not a correct date"

    @javascript
    Scenario: Updating a required date Field fails validation when using an empty value
        Given a Content Type with a "required" "date" exists
        And a Content of this type exists
        When I edit this content
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Delete Content using a Content Type that has a Date Field Type
    ##
    @javascript
    Scenario: Deleting a content that has a date field
        Given a Content Type with a "date" Field exists
        And a Content of this type exists
        When I delete this Content
        Then the Content is successfully deleted

    ##
    # Viewing content that has a date fieldtype
    ##
    @javascript
    Scenario: Viewing a Content that has a date fieldtype should show the expected value
        Given a Content Type with a "date" Field exists
        And a Content of this type exists with "date" Field Value set to "2015/12/31"
        When I view this Content
        Then I should see a field with value "2015/12/31"

    @javascript
    Scenario: Viewing a Content that has a date fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with a "date" Field exists
        And a Content of this type exists with "date" Field Value set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"
