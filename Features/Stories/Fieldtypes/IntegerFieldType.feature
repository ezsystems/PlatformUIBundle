Feature: Test the validations done on fields from PlatformUI - Integer fieldtype
    In order to validate the integer fieldtype
    As an Editor  user
    I need to be able to create, update and delete content with integer fieldtypes

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    @javascript
    Scenario: A Content of a Content Type that has an integer fieldtype must have an integer field
        Given a Content Type with an "integer" Field exists
        When I create a content of this Content Type
        Then I should have an "integer" field

    @javascript
    Scenario: When editing a Content the label of an integer field must have the same name of the field type from the respective Content Type
        Given a Content Type with an "integer" with "Name" "Quantity" exists
        When I create a content of this Content Type
        Then I should have a "Quantity:" label related with the "integer" field

    @javascript
    Scenario: The label of an mandatory integer field of a Content must have an * as suffix on the field's label's' name
        Given a Content Type with a "required" "integer" with "Name" "Quantity" exists
        When I create a content of this Content Type
        Then I should have an "Quantity*:" label related with the "integer" field

    ##
    # Creating Content using a Content Type that has an Integer Field Type
    ##
    @javascript
    Scenario: Publishing a valid integer Field works
        Given a Content Type with an "integer" Field exists
        When I create a content of this Content Type
        And I set "10" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing a valid integer Field works when using a value within limited scope
        Given a Content Type with an "integer" Field exists with Properties:
            | minimum value validator | 1 |
            | maximum value validator | 3 |
        When I create a content of this Type
        And I set "2" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing an invalid integer Field fails validation when using a value smaller than minimum value allowed
        Given a Content Type with an "integer" Field exists with Properties:
            | minimum value validator | 1 |
            | maximum value validator | 3 |
        When I create a content of this Type
        And I set "0" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be more than or equal to 1"

    @javascript
    Scenario: Publishing an invalid integer Field fails validation when using a value bigger than maximum value allowed
        Given a Content Type with an "integer" Field exists with Properties:
            | minimum value validator | 1 |
            | maximum value validator | 3 |
        When I create a content of this Type
        And I set "0" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be less than or equal to 3"

    @javascript
    Scenario: Publishing an invalid integer Field fails validation when using a string
        Given a Content Type with an "integer" Field exists
        When I create a content of this Type
        And I set "a" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be a valid integer number"

    @javascript
    Scenario: Publishing an invalid integer Field fails validation when using a float
        Given a Content Type with an "integer" Field exists
        When I create a content of this Type
        And I set "1.5" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be a valid integer number"

    @javascript
    Scenario: Publishing an required integer Field fails validation when using an empty value
        Given a Content Type with a "requited" "integer" exists
        When I create a content of this Content Type
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Update Content using a Content Type that has an Integer Field Type
    ##
    @javascript
    Scenario: Updating an integer field using a valid integer Field works
        Given a Content Type with an "integer" Field exists
        And a Content of this Content Type exists with "integer" Field Value set to "1"
        When I update this content setting "10" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating an integer Field works when using a value within limited scope
        Given a Content Type with an "integer" Field exists with Properties:
            | minimum value validator | 1 |
            | maximum value validator | 3 |
        And a Content of this Content Type exists with "integer" Field Value set to "1"
        When I update this content setting "2" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Updating an integer Field fails validation when using a value smaller than minimum value allowed
        Given a Content Type with an "integer" Field exists with Properties:
            | minimum value validator | 1 |
            | maximum value validator | 3 |
        And a Content of this Content Type exists with "integer" Field Value set to "2"
        When I update this content setting "0" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be more than or equal to 1"

    @javascript
    Scenario: Updating an integer Field fails validation when using a value bigger than maximum value allowed
        Given a Content Type with an "integer" Field exists with Properties:
            | minimum value validator | 1 |
            | maximum value validator | 3 |
        And a Content of this Content Type exists
        When I update this content setting "4" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be less than or equal to 3"

    @javascript
    Scenario: Updating an integer Field fails validation when using a string
        Given a Content Type with an "integer" Field exists
        And a Content of this Content Type exists
        When I update this content setting "a" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be a valid integer number"

    @javascript
    Scenario: Updating an integer Field fails validation  when using a float
        Given a Content Type with an "integer" Field exists
        And a Content of this Content Type exists
        When I update this content setting "1.5" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be a valid integer number"

    ##
    # Delete Content using a Content Type that has an Integer Field Type
    ##
    @javascript
    Scenario: Deleting a content that has an integer field
        Given a Content Type with an "integer" Field exists
        And a Content of this Content Type exists
        When I delete this Content
        Then the Content is successfully deleted

    ##
    # Viewing content that has an integer fieldtype
    ##
    @javascript
    Scenario: Viewing a Content that has an integer fieldtype should show the expected value when the value is positive
        Given a Content Type with an "integer" Field exists
        And a Content of this Content Type exists with "integer" Field Value set to "1"
        When I view this Content
        Then I should see a field with value "1"

    @javascript
    Scenario: Viewing a Content that has an integer fieldtype should return the expected value when the value is equal to zero
        Given a Content Type with an "integer" Field exists
        And a Content of this Content Type exists with "integer" Field Value set to "0"
        When I view this Content
        Then I should see a field with value "0"

    @javascript
    Scenario: Viewing a Content that has an integer fieldtype should return the expected value when the value is negative
        Given a Content Type with an "integer" Field exists
        And a Content of this Content Type exists with "integer" Field Value set to "-1"
        When I view this Content
        Then I should see a field with value "-1"

    @javascript
    Scenario: Viewing a Content that has an integer fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with an "integer" Field exists
        And a Content of this Content Type exists with "integer" Field Value set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"
