Feature: Test the validations done on fields from PlatformUI - Float fieldtype
    In order to validate the float fieldtype
    As an Editor  user
    I need to be able to create, update and delete content with float fieldtypes

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    @javascript
    Scenario: A Content of a Content Type that has an float fieldtype must have an float field
        Given a Content Type with an "float" Field exists
        When I create a content of this type
        Then I should see an "float" field

    @javascript
    Scenario: When editing a Content the label of an float field must have the same name than field type from the respective Content Type
        Given a Content Type with an "float" with "Name" "Weight" exists
        When I create a content of this type
        Then I should see a "Weight:" label related with the "float" field

    @javascript
    Scenario: The label of an mandatory float field of a Content must be marked as mandatory
        Given a Content Type with a "required" "float" with "Name" "Weight" exists
        When I create a content of this type
        Then the "Weight" field should be marked as mandatory

    ##
    # Creating Content using a Content Type that has an Float Field Type
    ##
    @javascript
    Scenario: Publishing a valid float Field works
        Given a Content Type with an "float" Field exists
        When I create a content of this type
        And I set "1.5" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing a valid float Field works when using an integer
        Given a Content Type with an "float" Field exists
        When I create a content of this type
        And I set "1" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing a valid float Field works when using a value within limited scope
        Given a Content Type with an "float" Field exists with Properties:
            | Validator               | Value |
            | minimum value validator | 2     |
            | maximum value validator | 3.1   |
        When I create a content of this Type
        And I set "2.5" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing an invalid float Field fails validation when using a value smaller than minimum value allowed
        Given a Content Type with an "float" Field exists with Properties:
            | Validator               | Value |
            | minimum value validator | 2     |
            | maximum value validator | 3.1   |
        When I create a content of this Type
        And I set "0.5" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be more than or equal to 2"

    @javascript
    Scenario: Publishing an invalid float Field fails validation when using a value bigger than maximum value allowed
        Given a Content Type with an "float" Field exists with Properties:
            | Validator               | Value |
            | minimum value validator | 2     |
            | maximum value validator | 3.1   |
        When I create a content of this Type
        And I set "4.5" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be less than or equal to 3.1"

    @javascript
    Scenario: Publishing an invalid float Field fails validation when using a string
        Given a Content Type with an "float" Field exists
        When I create a content of this Type
        And I set "a" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be a valid float number"

    @javascript
    Scenario: Publishing a required float Field fails validation when using an empty value
        Given a Content Type with a "required" "float" exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Update Content using a Content Type that has an Float Field Type
    ##
    @javascript
    Scenario: Updating an float field using a valid float Field works
        Given a Content Type with an "float" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "10.5" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating an float Field works when using a value within limited scope
        Given a Content Type with an "float" Field exists with Properties:
            | Validator               | Value |
            | minimum value validator | 1     |
            | maximum value validator | 3     |
        And a Content of this type exists
        When I edit this content
        And I set "2.5" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating an float Field fails validation when using a value smaller than minimum value allowed
        Given a Content Type with an "float" Field exists with Properties:
            | Validator               | Value |
            | minimum value validator | 1.5   |
            | maximum value validator | 3     |
        And a Content of this type exists
        When I edit this content
        And I set "0.5" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be more than or equal to 1.5"

    @javascript
    Scenario: Updating an float Field fails validation when using a value bigger than maximum value allowed
        Given a Content Type with an "float" Field exists with Properties:
            | Validator               | Value |
            | minimum value validator | 1     |
            | maximum value validator | 3.5   |
        And a Content of this type exists
        When I edit this content
        And I set "4.5" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be less than or equal to 3.5"

    @javascript
    Scenario: Updating an float Field fails validation when using a string
        Given a Content Type with an "float" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "a" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be a valid float number"

    @javascript
    Scenario: Updating a required float Field fails validation when using an empty value
        Given a Content Type with a "required" "float" exists
        And a Content of this type exists
        When I edit this content
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Delete Content using a Content Type that has an Float Field Type
    ##
    @javascript
    Scenario: Deleting a content that has an float field
        Given a Content Type with an "float" Field exists
        And a Content of this type exists
        When I delete this Content
        Then the Content is successfully deleted

    ##
    # Viewing content that has an float fieldtype
    ##
    @javascript
    Scenario: Viewing a Content that has an float fieldtype should show the expected value when the value is positive
        Given a Content Type with an "float" Field exists
        And a Content of this type exists with "float" Field Value set to "1.5"
        When I view this Content
        Then I should see a field with value "1.5"

    @javascript
    Scenario: Viewing a Content that has an float fieldtype should return the expected value when the value is equal to zero
        Given a Content Type with an "float" Field exists
        And a Content of this type exists with "float" Field Value set to "0"
        When I view this Content
        Then I should see a field with value "0"

    @javascript
    Scenario: Viewing a Content that has an float fieldtype should return the expected value when the value is negative
        Given a Content Type with an "float" Field exists
        And a Content of this type exists with "float" Field Value set to "-1.5"
        When I view this Content
        Then I should see a field with value "-1.5"

    @javascript
    Scenario: Viewing a Content that has an float fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with an "float" Field exists
        And a Content of this type exists with "float" Field Value set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"
