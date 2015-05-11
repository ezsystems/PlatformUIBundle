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
        When I create a content of this Content Type
        Then I should have a "checkbox" field

    @javascript
    Scenario: When editing a Content the label of a checkbox field must have the same name of the field type from the respective Content Type
        Given a Content Type with a "checkbox" with "Name" "Do you agree?" exists
        When I create a content of this Content Type
        Then I should have a "Do you agree?:" label related with the "checkbox" field

    @javascript
    Scenario: The label of an mandatory checkbox field of a Content must have an * as suffix on the field's label's' name
        Given a Content Type with a "required" "checkbox" with "Name" "Do you agree?" exists
        When I create a content of this Content Type
        Then I should have an "Do you agree?*:" label related with the "checkbox" field

    ##
    # Creating Content using a Content Type that has a Checkbox Field Type
    ##
    @javascript
    Scenario: Publishing a valid checkbox Field works
        Given a Content Type with a "checkbox" Field exists
        When I create a content of this Content Type
        And I check the Field Value
        And I publish the content
        Then the Content is successfully published

    ##
    # Update Content using a Content Type that has a Checkbox Field Type
    ##
    @javascript
    Scenario: Updating a Checkbox field using a valid checkbox Field works
        Given a Content Type with a "checkbox" Field exists
        And a Content of this Content Type exists with "checkbox" Field Value checked
        When I update this content unchecking the Field Value
        And I publish the content
        Then the Content is successfully published

    ##
    # Delete Content using a Content Type that has a Checkbox Field Type
    ##
    @javascript
    Scenario: Deleting a content that has a Checkbox field
        Given a Content Type with a "checkbox" Field exists
        And a Content of this Content Type exists
        When I delete this Content
        Then the Content is successfully deleted

    ##
    # Viewing content that has a Checkbox fieldtype
    ##
    @javascript
    Scenario: Viewing a Content that has a Checkbox fieldtype should show the expected value when the checkbox is checked
        Given a Content Type with a "checkbox" Field exists
        And a Content of this Content Type exists with "checkbox" Field Value checked
        When I view this Content
        Then I should see a field with value "Yes"

    @javascript
    Scenario: Viewing a Content that has a Checkbox fieldtype should show the expected value when the checkbox is unchecked
        Given a Content Type with a "checkbox" Field exists
        And a Content of this Content Type exists with "checkbox" Field Value unchecked
        When I view this Content
        Then I should see a field with value "No"
