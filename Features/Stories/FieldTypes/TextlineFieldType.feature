Feature: Test the validations done on fields from PlatformUI - text line fieldtype
    In order to validate the text line fieldtype
    As an Editor user
    I need to be able to create and update content with text line fieldtypes

    Background:
       Given I am logged in as an 'Administrator' in PlatformUI

    ##
    # Validate the existence of expected fields from a field type when creating a content
    ##
    @javascript @common
    Scenario: A Content item of an Content Type that has a Text Line Field Definition must have a Text Line Field
        Given a Content Type with an "text line" Field exists
        When I create a content of this type
        Then I should see a "text line" field

    @javascript @common
    Scenario: When editing Content item, the label of a Text Line Field must be the corresponding Field Definition name
        Given a Content Type with an "text line" with field definition name "Test text" exists
        When I create a content of this type
        Then I should see a "Test text" label related with the "text line" field

    @javascript @common
    Scenario: The label of a required text line field of a Content must be marked as required
        Given a Content Type with a required "text line" with field definition name "Required" exists
        When I create a content of this type
        Then the "Required" field should be marked as required

    ##
    # Creating Content using a Content Type that has a text line Field Type
    ##
    @javascript @common
    Scenario: A Content item with a Text Line Field can be published
        Given a Content Type with an "text line" Field exists
        When I create a content of this type
        And I set "Test text" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @common
    Scenario: Creating a text line Field with an empty value works
        Given a Content Type with an "text line" Field exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @edge
    Scenario: Creating a required text line Field fails validation when using an empty value
        Given a Content Type with a required "text line" Field exists
        When I create a content of this type
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    @javascript @common
    Scenario: Creating a valid text line Field works when using a value within limited character scope
        Given a Content Type with an "text line" Field exists with Properties:
            | Validator                | Value |
            | minimum length validator | 2     |
            | maximum length validator | 4     |
        When I create a content of this Type
        And I set "LOL" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @edge
    Scenario: Creating an invalid text line Field fails validation when using a value smaller than minimum character limit allowed
        Given a Content Type with an "text line" Field exists with Properties:
            | Validator                | Value |
            | minimum length validator | 2     |
            | maximum length validator | 4     |
        When I create a content of this Type
        And I set "X" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should have at least 2 characters"

    @javascript @edge @broken
    Scenario: Creating an invalid content type with a text line Field fails validation when using a maximum bigger than the minimum character limit
        Given I am on the "Content types" page
        And I click on the "Content" link
        When I click at "Create a content type" button
        And I fill form with:
            | Field      | Value |
            | Name       | Test  |
            | Identifier | test  |
        And I add a field type "Text line" with:
            | Field           | Value |
            | Name            | Text  |
            | Identifier      | text  |
            | Minimum length  | 4     |
            | Maximum length  | 2     |
        And I click at "OK" button
        Then Publishing fails with validation error message "Form did not validate. Please review errors below."

    @javascript @edge @broken
    Scenario: Creating a valid content type with a text line Field works when using a minimum equal to the maximum character limit
        Given I am on the "Content types" page
        And I click in the "Content" Content type group
        When I click at "Create a content type" button
        And I fill form with:
            | Field      | Value |
            | Name       | Test  |
            | Identifier | test  |
        And I add a field type "Text line" with:
            | Field           | Value |
            | Name            | Text  |
            | Identifier      | text  |
            | Minimum length  | 4     |
            | Maximum length  | 4     |
        And I click at "OK" button
        Then the Content is successfully published with the message "The Content type draft was successfully updated and published. Related Content has also been updated."

    @javascript @edge @broken
    Scenario: Creating an invalid content type with a text line Field fails when using a negative minimum character limit
        Given I am on the "Content types" page
        And I click in the "Content" Content type group
        When I click at "Create a content type" button
        And I fill form with:
            | Field      | Value |
            | Name       | Test  |
            | Identifier | test  |
        And I add a field type "Text line" with:
            | Field           | Value |
            | Name            | Text  |
            | Identifier      | text  |
            | Minimum length  | -1    |
            | Maximum length  | 4     |
        And I click at "OK" button
        Then Publishing fails with validation error message "Form did not validate. Please review errors below."

    @javascript @edge @broken
    Scenario: Creating an invalid content type with a text line Field fails when using a maximum character limit equal to zero
        Given I am on the "Content types" page
        And I click in the "Content" Content type group
        When I click at "Create a content type" button
        And I fill form with:
            | Field      | Value |
            | Name       | Test  |
            | Identifier | test  |
        And I add a field type "Text line" with:
            | Field           | Value |
            | Name            | Text  |
            | Identifier      | text  |
            | Minimum length  | 0     |
            | Maximum length  | 0     |
        And I click at "OK" button
        Then Publishing fails with validation error message "Form did not validate. Please review errors below."

    @javascript @edge @broken
    Scenario: Creating an invalid content type with a text line Field fails when using a negative maximum character limit
        Given I am on the "Content types" page
        And I click in the "Content" Content type group
        When I click at "Create a content type" button
        And I fill form with:
            | Field      | Value |
            | Name       | Test  |
            | Identifier | test  |
        And I add a field type "Text line" with:
            | Field           | Value |
            | Name            | Text  |
            | Identifier      | text  |
            | Minimum length  | 0     |
            | Maximum length  | -1    |
        And I click at "OK" button
        Then Publishing fails with validation error message "Form did not validate. Please review errors below."

    ##
    # Update Content using a Content Type that has a text line Field Type
    ##
    @javascript @common
    Scenario: Updating a text line field using a text line Field works
        Given a Content Type with an "text line" Field exists
        And a Content of this type exists
        When I edit this content
        And I set "Test text update" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @edge
    Scenario: Updating a text line Field with an empty value works
        Given a Content Type with an "text line" Field exists
        And a Content of this type exists
        When I edit this content
        And I set an empty value as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @common
    Scenario: Updating a valid text line Field works when using a value within limited character scope
        Given a Content Type with an "text line" Field exists with Properties:
            | Validator                | Value |
            | minimum length validator | 2     |
            | maximum length validator | 4     |
        When I edit this content
        And I set "LOL" as the Field Value
        And I publish the content
        Then the Content is successfully published

    @javascript @edge
    Scenario: Updating a text line Field fails validation when using a value smaller than minimum character limit allowed
        Given a Content Type with an "text line" Field exists with Properties:
            | Validator                | Value |
            | minimum length validator | 2     |
            | maximum length validator | 4     |
        When I edit this content
        And I set "X" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should have at least 2 characters"

    @javascript @edge @broken
    Scenario: Updating a text line Field fails validation when using a value bigger than maximum character limit allowed
        Given a Content Type with an "text line" Field exists with Properties:
            | Validator                | Value |
            | minimum length validator | 2     |
            | maximum length validator | 4     |
        When I edit this content
        And I set "Hipopotomonstrosesquipedaliofobia" as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "The value should have at most 4 characters"

    @javascript @common
    Scenario: Updating a required text line Field fails validation when using an empty value
        Given a Content Type with a required "text line" Field exists
        And a Content of this type exists
        When I edit this content
        And I set an empty value as the Field Value
        And I publish the content
        Then Publishing fails with validation error message "This field is required"

    ##
    # Viewing content that has a text line fieldtype
    ##
    @javascript @common
    Scenario: Viewing a Content that has a text line fieldtype should show the expected value when the value is plausible
        Given a Content Type with an "text line" Field exists
        And a Content of this type exists with "text line" Field Value set to "Test text"
        When I view this Content
        Then I should see a field with value "Test text"

    @javascript @common
    Scenario: Viewing a Content that has a text line fieldtype should return "This field is empty" when the value is empty
        Given a Content Type with an "text line" Field exists
        And a Content of this type exists with "text line" Field Value set to empty
        When I view this Content
        Then I should see a field with value "This field is empty"
