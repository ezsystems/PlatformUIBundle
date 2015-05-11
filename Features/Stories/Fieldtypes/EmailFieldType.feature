Feature: Test the validations done on fields from PlatformUI - Email fieldtype
    In order to validate the email fieldtype
    As an Editor  user
    I need to be able to create, update and delete content with email fieldtype

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    @javascript
    Scenario: A Content of a Content Type that has an email fieldtype must have an email field
        Given a Content Type with an "email" Field exists
        When I create a content of this Content Type
        Then I should have an "email" field

    @javascript
    Scenario: When editing a Content the label of an email field must have the same name of the field type from the respective Content Type
        Given a Content Type with an "email" with "Name" "Email Contact" exists
        When I create a content of this Content Type
        Then I should have a "Email Contact:" label related with the "email" field

    @javascript
    Scenario: The label of an mandatory email field of a Content must have an * as suffix on the field's label's' name
        Given a Content Type with a "required" "email" with "Name" "Email Contact" exists
        When I create a content of this Content Type
        Then I should have an "Email Contact*:" label related with the "email" field

    ##
    # Creating Content using a Content Type that has an email Field Type
    ##
    @javascript
    Scenario: Publishing a valid email Field works
        Given a Content Type with an "email" Field exists
        When I create a content of this Content Type
        And I set "paul@acme.com" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing an invalid email Field fails validation when using an invalid email
        Given a Content Type with an "email" Field exists
        When I create a content of this Content Type
        And I set "paul.acme.com" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "Please check the email syntax"

    @javascript
    Scenario: Publishing an required email Field fails validation when using an empty value
        Given a Content Type with a "requited" "email" exists
        When I create a content of this Content Type
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Update Content using a Content Type that has an email Field Type
    ##
    @javascript
    Scenario: Updating to a valid email Field works
        Given a Content Type with an "email" Field exists
        And a Content of this Content Type exists with "email" Field Value set to "paul@acme.com"
        When I update this content setting "ana@acme.com" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript
    Scenario: Publishing an invalid email Field fails validation when using an invalid email
        Given a Content Type with an "email" Field exists
        And a Content of this Content Type exists with "email" Field Value set to "paul@acme.com"
        When I update this content setting an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "Please check the email syntax"

    @javascript
    Scenario: Publishing an required email Field fails validation when using an empty value
        Given a Content Type with a "requited" "email" exists
        When I create a content of this Content Type
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Delete Content using a Content Type that has an email Field Type
    ##
    @javascript
    Scenario: Deleting a content that has an email field
        Given a Content Type with an "email" Field exists
        And a Content of this Content Type exists
        When I delete this Content
        Then the Content is successfully deleted

    ##
    # Viewing content that has an email fieldtype
    ##
    @javascript
    Scenario: Viewing a Content that has an email fieldtype should show the expected value
        Given a Content Type with an "email" Field exists
        And a Content of this Content Type exists with "email" Field Value set to "paul@acme.com"
        When I view this Content
        Then I should see a field with value "paul@acme.com"

    @javascript
    Scenario: Viewing a Content that has an email fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with an "email" Field exists
        And a Content of this Content Type exists with "email" Field Value set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"
