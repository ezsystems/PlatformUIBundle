Feature: Test the validations done on fields from PlatformUI - country fieldtype
    In order to validate the country fieldtype
    As an Editor user
    I need to be able to create and update content with country fieldtypes

    Background:
       Given I am logged in as an 'Administrator' in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    @javascript @common
    Scenario: A Content of a Content Type that has a country fieldtype must have a text field
        Given a Content Type with an "country" Field exists
        When I create a content of this type
        Then I should see a "country" field

    @javascript @edge
    Scenario: When editing a Content, the label of a country field must have the same name than field type from the respective Content Type
        Given a Content Type with an "country" with field definition name "Test label" exists
        When I create a content of this type
        Then I should see a "Test label" label related with the "country" field

    @javascript @common
    Scenario: The label of a required country field of a Content must be marked as required
        Given a Content Type with a required "country" with field definition name "Required" exists
        When I create a content of this type
        Then the "Required" field should be marked as required

    ##
    # Creating Content using a Content Type that has a country Field Type
    ##
    @javascript @common
    Scenario: Creating a country Field works
        Given a Content Type with an "country" Field exists
        When I create a content of this type
        And I set the option "Portugal" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @edge
    Scenario: Creating a country Field with an empty value works
        Given a Content Type with an "country" Field exists
        When I create a content of this type
        And I set no option as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @common
    Scenario: Creating a country Field with multiple countries works
        Given a Content Type with an "country" Field exists with Properties:
            | Validator          | Value |
            | multiple setting | true  |
        When I create a content of this type
        And I add the option "Peru" as the Field Value
        And I add the option "Turkey" as the Field Value
        And I add the option "Guinea" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @common
    Scenario: Creating a required country Field fails validation when using an empty value
        Given a Content Type with a required "country" Field exists
        When I create a content of this type
        And I set no option as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    @javascript @edge
    Scenario: Creating a required country Field with multiple countries fails validation when using an empty value
        Given a Content Type with an required "country" Field exists with Properties:
            | Validator        | Value |
            | multiple setting | true  |
        When I create a content of this type
        And I set no option as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Update Content using a Content Type that has a country Field Type
    ##
    @javascript @common
    Scenario: Updating a country field using a country Field works
        Given a Content Type with an "country" Field exists
        And a Content of this type exists
        When I edit this content
        And I set no option as the Field Value
        And I set the option "Brazil" as the Field Value
        Then I should see a field with value "Brazil"

    @javascript @edge
    Scenario: Updating a country Field with an empty value works
        Given a Content Type with an "country" Field exists
        When I create a content of this type
        And I set no option as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @common
    Scenario: Updating an country Field with multiple countries works
        Given a Content Type with an "country" Field exists with Properties:
            | Validator        | Value |
            | multiple setting | true  |
        And a Content of this type exists
        When I edit this content
        And I add the option "Peru" as the Field Value
        And I add the option "Turkey" as the Field Value
        And I add the option "Guinea" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @now
    Scenario: Updating a required country Field fails validation when using an empty value
        Given a Content Type with a required "country" Field exists
        And a Content of this type exists
        When I edit this content
        And I set no option as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    @javascript @edge
    Scenario: Updating a required country Field with multiple countries fails validation when using an empty value
        Given a Content Type with an required "country" Field exists with Properties:
            | Validator        | Value |
            | multiple setting | true  |
        And a Content of this type exists
        When I edit this content
        And I set no option as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Viewing content that has a country fieldtype
    ##
    @javascript @common
    Scenario: Viewing a Content that has a country fieldtype should show the expected value when the value is plausible
        Given a Content Type with an "country" Field exists
        When I create a content of this type
        And I set the option "Portugal" as the Field Value
        Then I should see a field with value "Portugal"

    @javascript @edge
    Scenario: Viewing a Content that has a country fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with an "country" Field exists
        And a Content of this type exists with "country" Field Value set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"
