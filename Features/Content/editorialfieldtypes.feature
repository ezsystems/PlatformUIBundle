@editorial
Feature: Test the validations done on fields from Editorial Interface
    In order to use the Editorial fields
    As a user
    I want to validate the use of the fields data

    #https://confluence.ez.no/display/DEV/CheckboxEditView
    #valid when the user input is valid
    @ezp-21616 @qa-207
    Scenario Outline: Validate checkbox using valid data
        Given I am logged in as "Admin"
        And I have a "field A" of type "checkbox"
        And "field A" is not mandatory
        And I am on "field A"
        And on "field A" I fill with <checkbox_value>
        Then I see no label message with an error

        Examples: 
            | checkbox |
            | 0        |
            | 1        |

    #checkbox -  A click on the label changes the checked status
    #The label of the field and the input field are connected with the id and the for attributes so that a click on the label toggles the state of the checkbox.
    @javascript @ezp-21616 @qa-207
    Scenario Outline: Verify that a click on the label shanges the checkbox status value
        Given I am logged in as "Admin"
        And I have a "field A" of type "checkbox"
        And the "field A" has a label "L"
        And I fill "field A" with value <checkbox_value_initial>
        When I click on label "L"
        Then the "field A" should contain <checkbox_value_final>

        Examples: 
            | checkbox_value_initial | checkbox_value_final |
            | checked                | unchecked            |
            | unchecked              | checked              |

    #checkbox - The label and the description come from the field definition in the Content Type.
    #The description from the definition is put just after the checkbox
    @javascript @ezp-21616 @qa-207
    Scenario: The label and the description come from the field definition in the Content Type
        Given I am logged in as "Admin"
        And I have a content type "B" with the following fields:
            | type_field | name_field  | description                |
            | Checkbox   | Check_value | checkbox_description_value |
        When I create a content "A" of content type "B"
        Then content "A" has a label "L1" in the checkbox
        And content "A" has a description "D1" in the checkbox
        And the "L1" has the value "check_value"
        And the "D1" has the value "checkbox_description_value"
