Feature: Test the validations done on fields from PlatformUI - Email fieldtype
    In order to validate the e-mail address fieldtype
    As an Editor user
    I need to be able to create and update content with e-mail address fieldtype

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    @javascript @common
    Scenario: A Content of a Content Type that has an e-mail address fieldtype must have an email field
        Given a Content Type with an "e-mail address" Field exists
        When I create a content of this type
        Then I should see an "e-mail address" field

    @javascript @common
    Scenario: When editing a Content the label of an e-mail address field must have the same name than field type from the respective Content Type
        Given a Content Type with an "e-mail address" with field definition name "Email Contact" exists
        When I create a content of this type
        Then I should see an "Email Contact" label related with the "e-mail address" field

    @javascript @common
    Scenario: The label of a required e-mail address field of a Content must be marked as required
        Given a Content Type with a required "e-mail address" with field definition name "Required" exists
        When I create a content of this type
        Then the "Required" field should be marked as required

    ##
    # Creating Content using a Content Type that has an e-mail address Field Type
    ##
    @javascript @common
    Scenario: Creating a valid e-mail address Field works
        Given a Content Type with an "e-mail address" Field exists
        When I create a content of this type
        And I set "paul@acme.com" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @common
    Scenario: Creating an invalid e-mail address Field fails validation when using an invalid email
        Given a Content Type with an "e-mail address" Field exists
        When I create a content of this type
        And I set "paul.acme.com" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be a valid email address"

    @javascript @edge
    Scenario: Creating an e-mail address Field with an empty value works
        Given a Content Type with an "e-mail address" Field exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @edge
    Scenario: Creating a required e-mail address Field fails validation when using an empty value
        Given a Content Type with a required "e-mail address" with field definition name "Required" exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Update Content using a Content Type that has an e-mail address Field Type
    ##
    @javascript @edge
    Scenario: Updating to a valid e-mail address Field works
        Given a Content Type with an "e-mail address" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "ana@acme.com" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @common
    Scenario: Updating an invalid e-mail address Field fails validation when using an invalid email
        Given a Content Type with an "e-mail address" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "invalidEmail" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should be a valid email address"

    @javascript @edge
    Scenario: Updating a required e-mail address Field fails validation when using an empty value
        Given a Content Type with a required "e-mail address" with field definition name "Required" exists
        And a Content of this type exists
        When I edit this content
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Viewing content that has an email fieldtype
    ##
    @javascript @edge
    Scenario: Viewing a Content that has an e-mail address fieldtype should show the expected value when the value is plausible
        Given a Content Type with an "e-mail address" Field exists
        And a Content of this type exists with "e-mail address" Field Value set to "paul@acme.com"
        When I view this Content
        Then I should see a field with value "paul@acme.com"

    @javascript @edge
    Scenario: Viewing a Content that has an e-mail address fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with an "e-mail address" Field exists
        And a Content of this type exists with "e-mail address" Field Value set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"
