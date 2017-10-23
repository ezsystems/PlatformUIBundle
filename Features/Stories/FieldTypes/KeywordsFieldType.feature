Feature: Test the validations done on fields from PlatformUI - keywords fieldtype
    In order to validate the keywords fieldtype
    As an Editor user
    I need to be able to create and update content with keywords fieldtypes

    Background:
       Given I am logged in as an 'Administrator' in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    @javascript @common
    Scenario: A Content of a Content Type that has a keywords fieldtype must have a text field
        Given a Content Type with an "keywords" field exists
        When I create a content of this type
        Then I should see a "keywords" field

    @javascript @edge
    Scenario: When editing a Content, the label of a keywords field must have the same name than field type from the respective Content Type
        Given a Content Type with an "keywords" with field definition name "Test text" exists
        When I create a content of this type
        Then I should see a "Test text" label related with the "keywords" field

    @javascript @edge
    Scenario: The label of a required keywords field of a Content must be marked as required
        Given a Content Type with a required "keywords" with field definition name "Required" exists
        When I create a content of this type
        Then the "Required" field should be marked as required

    ##
    # Creating Content using a Content Type that has a keywords Field Type
    ##
    @javascript @common
    Scenario: Creating a keywords Field works
        Given a Content Type with an "keywords" field exists
        When I create a content of this type
        And I set "Test text" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @common
    Scenario: Creating a keywords Field with an empty value works
        Given a Content Type with an "keywords" field exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @edge
    Scenario: Creating a required keywords Field fails validation when using an empty value
        Given a Content Type with a required "keywords" Field exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Update Content using a Content Type that has a keywords Field Type
    ##
    @javascript @common
    Scenario: Updating a keywords field using a keywords Field works
        Given a Content Type with an "keywords" field exists
        And a Content of this type exists
        When I edit this content
        And I set "Test keywords update" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @common
    Scenario: Updating a keywords Field with an empty value works
        Given a Content Type with an "keywords" field exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @edge @notWorking
    Scenario: Updating a required keywords Field fails validation when using an empty value
        Given a Content Type with a required "keywords" Field exists
        And a Content of this type exists
        When I edit this content
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Viewing content that has a keywords fieldtype
    ##
    @javascript @edge
    Scenario: Viewing a Content that has a keywords fieldtype should show the expected value when the value is plausible
        Given a Content Type with an "keywords" field exists
        And a Content of this type exists with "keywords" Field Value set to "Test text"
        When I view this Content
        Then I should see a field with value "Test text"

    @javascript @edge
    Scenario: Viewing a Content that has a keywords fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with an "keywords" field exists
        And a Content of this type exists with "keywords" Field Value set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"