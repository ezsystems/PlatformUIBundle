@editorial
Feature: Test the validations done on fields from Editorial Interface
    In order to use the Editorial fields
    As a user
    I want to validate the use of the fields data

    #https://confluence.ez.no/display/DEV/FloatEditView
    #valid when the user input is valid
    #check whether the input is filled (if the Field is set required)
    #float - check that the input is a float (done while typing)
    @ezp-21649 @qa-223
    Scenario Outline: Validate float when exiting the field using valid data
        Given I am logged in as "Admin"
        And I have a "field A" of type "float"
        And "field A" is not mandatory
        And I am on "field A"
        And on "field A" I fill with <float>
        Then I see no label message with an error

        Examples: 
            | float |
            | 3.15  |
            | -3.15 |
            | 3,15  |
            | -3,15 |
            | 0     |
            |       |

    #float - check that the input is a float (done while typing)
    @ezp-21649 @qa-223
    Scenario Outline: Validate float when exiting the field using invalid float
        Given I am logged in as "Admin"
        And I have a "field A" of type "float"
        And I am on "field A"
        And on "field A" I fill with <float>
        Then I see a label message with an error

        Examples: 
            | float |
            | a     |

    #float - check whether the input is filled (if the Field is set required)
    @ezp-21649 @qa-223
    Scenario Outline: Validate float when exiting the field using invalid float
        Given I am logged in as "Admin"
        And I have a "field A" of type "float"
        And I am on "field A"
        And on "field A" I fill with <float>
        And "field A" is mandatory
        When I exit the "field A"
        Then I see a label message with an error

        Examples: 
            | float |
            |       |

    #float - Valid values within defined range - within, equal to superior, equal to inferior
    #check that the float is in the correct range (if the field definition is configured with a min and/or max value)
    @ezp-21649 @qa-223
    Scenario Outline: Create an object that has a float fieldtype filled with within range values
        Given I am logged in as "Admin"
        And I have a "field A" of type "float"
        And I defined an inferior and superior range for "field A"
            | 1 | 10 |
        And I am on "field A"
        And on "field A" I fill with <float>
        When I exit the "field A"
        Then I see no label message with an error

        Examples: 
            | float |
            | 3.15  |
            | 1     |
            | 10    |
            | 5.5   |
            | 5,5   |
            | 5     |

    #float - use of invalid value - out of superior and inferior range
    #check that the float is in the correct range (if the field definition is configured with a min and/or max value)
    @ezp-21649 @qa-223
    Scenario Outline: Create an object that has a float fieldtype filled with out of range values
        Given I am logged in as "Admin"
        And I have a "field A" of type "float"
        And I defined an inferior and superior range for "field A"
            | 1 | 10 |
        And I am on "field A"
        And on "field A" I fill with <float>
        When I exit the "field A"
        Then I see a label message with an error

        Examples: 
            | float |
            | 0     |
            | 11    |

    #float -  A click on the label gives the focus to the input field
    #The label of the "field A"nd the input "field A"re connected with the id and the for attributes so that a click on the label gives the focus to the input field.
    @javascript @ezp-21649 @qa-223
    Scenario: Verify that a click on the label gives the focus to the input field
        Given I am logged in as "Admin"
        And I have a "field A" of type "float"
        And I have a label "L" with message "M1"
        When I click on label "L"
        Then I goto "field A"

    #float - Change the label when the user changes something
    #change when the user changes something
    @javascript @ezp-21649 @qa-223
    Scenario: Change the label when the user changes something
        Given I am logged in as "Admin"
        And I have a "field A" of type "float"
        And I have a label "L" with message "M1"
        When I update the "field A"
        And I see a label "L" with message "M2"
        And message "M2" is different from message "M1"

    #float - The label and the description below it come from the field definition in the Content Type.
    @javascript @ezp-21649 @qa-223
    Scenario: The label and the description come from the field definition in the Content Type
        Given I am logged in as "Admin"
        And I have a content type "B" with the following fields:
            | type_field | name_field | description       |
            | float      | float_name | float_description |
        When I create a content "A" of content type "B"
        Then content "A" has a label "L1"
        And content "A" has a description "D1"
        And the "L1" has the value "float_name"
        And the "D1" has the value "float_description"
