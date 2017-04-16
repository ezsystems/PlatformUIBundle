Feature: Test the validations done on fields from Editorial Interface - Checkbox fieldtype
    In order to validate the checkbox fieldtype
    As an Editor  user
    I need to be able to create, update and delete content with checkbox fieldtypes

    Background:
        Given I am logged in as an Editor in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    ##
    @javascript
    Scenario: A Content of a Content Type that has a checkbox fieldtype must have a Checkbox field
        Given a Content Type with a "checkbox" Field exists
        When I create a content of this type
        Then I should see a "checkbox" field

    @javascript
    Scenario: When editing a Content the label of a checkbox field must have the same name than field type from the respective Content Type
        Given a Content Type with a "checkbox" with "Name" "Do you agree?" exists
        When I create a content of this type
        Then I should see a "Do you agree?:" label related with the "checkbox" field

    @javascript
    Scenario: The label of an mandatory checkbox field of a Content must be marked as mandatory
        Given a Content Type with a "required" "checkbox" with "Name" "Do you agree?" exists
        When I create a content of this type
        Then the "Do you agree?" field should be marked as mandatory

    ##
    # Creating Content using a Content Type that has a Checkbox Field Type
    ##
    @javascript
    Scenario: Publishing a valid checkbox Field works
        Given a Content Type with a "checkbox" Field exists
        When I create a content of this type
        And I check the Field Value
        And I publish the content
        Then the Content is successfully published

    ##
    # Update Content using a Content Type that has a Checkbox Field Type
    ##
    @javascript
    Scenario: Updating a Checkbox field using a valid checkbox Field works
        Given a Content Type with a "checkbox" Field exists
        And a Content of this type exists with "checkbox" Field Value checked
        When I edit this content
        And I uncheck the Field Value
        And I publish the content
        Then the Content is successfully published

    ##
    # Delete Content using a Content Type that has a Checkbox Field Type
    ##
    @javascript
    Scenario: Deleting a content that has a Checkbox field
        Given a Content Type with a "checkbox" Field exists
        And a Content of this type exists
        When I delete this Content
        Then the Content is successfully deleted

    ##
    # Viewing content that has a Checkbox fieldtype
    ##
    @javascript
    Scenario: Viewing a Content that has a Checkbox fieldtype should show the expected value when the checkbox is checked
        Given a Content Type with a "checkbox" Field exists
        And a Content of this type exists with "checkbox" Field Value checked
        When I view this Content
        Then I should see a field with value "Yes"

    @javascript
    Scenario: Viewing a Content that has a Checkbox fieldtype should show the expected value when the checkbox is unchecked
        Given a Content Type with a "checkbox" Field exists
        And a Content of this type exists with "checkbox" Field Value unchecked
        When I view this Content
        Then I should see a field with value "No"
