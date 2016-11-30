@editorial
Feature: Test the validations done on fields from Editorial Interface
    In order to use the Editorial fields
    As a user
    I want to validate the use of the fields data

    #https://confluence.ez.no/display/DEV/TextBlockEditView
    #https://confluence.ez.no/display/PR/n01+Basic+Edit+via+tree+navigation+-+explanations+-+fields+editing#n01BasicEditviatreenavigation-explanations-fieldsediting-Textblock
    #TextBlockEditView - Validation using a valid textblock
    @ezp-21309 @qa-244
    Scenario Outline: Validate TextBlockEditView when exiting the field using valid data
        Given I am logged in as "Admin"
        And I have a "field A" of type "textblock"
        And "field A" is not mandatory
        And I am on "field A"
        And on "field A" I fill with <textblock_value>
        When I exit the "field A"
        Then I see no label message with an error

        Examples: 
            | textblock_value |
            | This is a text  |
            | 3               |
            |                 |

    #TextBlockEditView - check whether the input is filled (if the field is set required)
    @ezp-21309 @qa-244
    Scenario: check whether the input is filled if the field is set required
        Given I am logged in as "Admin"
        And I have a "field A" of type "textblock"
        And "field A" is mandatory
        And I am on "field A"
        And on "field A" I fill with ""
        When I exit the "field A"
        Then I see a label message with an error

    #TextBlockEditView - The label of the field and the input field are connected with the id and the for attributes so that a click on the label gives the focus to the input field
    @ezp-21309 @qa-244
    Scenario: Verify that the label of the field and the input field are connected
        Given I am logged in as "Admin"
        And I have a "field A" of type "textblock"
        And I have a label "L" of "field A"
        When I click on label "L"
        Then I goto "field A"

    #TextBlockEditView - The label and the description come from the field definition in the Content Type.
    @javascript @ezp-21309 @qa-244
    Scenario: Verify that the label and the description come from the field definition in the Content Type
        Given I am logged in as "Admin"
        And I have a content type "B" with the following fields:
            | type_field | name_field           | description_field           |
            | Textblock  | textblock_name_value | textblock_description_value |
        When I create a content "A" of content type "B"
        Then content "A" has a label "L1" in the checkbox
        And content "A" has a description "D1" in the checkbox
        And the "L1" has the value "textblock_name_value"
        And the "D1" has the value "textblock_description_value"
