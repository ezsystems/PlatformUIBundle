@editorial @ezp-21644
Feature: Test the validations done on Integer field from Editorial Interface
    In order to use the Integer field of Y.eZ.IntegerEditView class
    As a user
    I want to validate the use of the Integer field data

    #https://confluence.ez.no/display/DEV/IntegerEditView
    
    #IntegerEditView - Validation on exiting the field using a valid integer
    #valid when the user input is valid
    #check whether the input is filled (if the field is set required)
    @javascript
    Scenario Outline: Validate IntegerEditView when exiting the field using valid data
        Given I am logged in as "Anonymous"
        And I have a field A of type "Integer"
        And field A is not mandatory
        And I fill the field A with the following <integer>
        When I exit the field A
        Then I see no label message with an error

        Examples:
            | integer |
            | 3       |
            | -3      |
            | 0       |
            ||

    #IntegerEditView - Validation on exiting the field using an invalid integer
    #error when the user input is not valid
    #check whether the input is filled (if the field is set required)
    @javascript
    Scenario Outline: Validate IntegerEditView when exiting the field using invalid integer
        Given I am logged in as "Anonymous"
        And I have a field A of type "Integer"
        And I fill the field A with the following <integer>
        And field A is mandatory
        When I exit the field A
        Then I see a label message with an error

        Examples:
            | integer |
            | a       |
            | 1.5     |
            | -1.5    |
            | 1,5     |
            | -1,5    |
            ||

    #IntegerEditView - Valid values within defined range - within, equal to superior, equal to inferior
    #check that the integer is in the correct range (if the field definition is configured with a min and/or max value)
    @javascript
    Scenario Outline: Create an object that has a IntegerEditView fieldtype filled with within range values 
        Given I am logged in as "Anonymous"
        And I have a field A of type "IntegerEditView"
        And I defined an inferior and superior range for field A
            | 1 | 10 |
        And I fill the field A with the following data <integer>
        When I exit the field A
        Then I see no label message with an error

        Examples:
            | integer |
            | 3       |
            | 1       |
            | 10      |

    #IntegerEditView - use of invalid value - out of superior and inferior range
    #check that the integer is in the correct range (if the field definition is configured with a min and/or max value)
    @javascript
    Scenario Outline: Create an object that has a IntegerEditView fieldtype filled with out of range values 
        Given I am logged in as "Anonymous"
        And I have a field A of type "IntegerEditView"
        And I defined an inferior and superior range for field A
            | 1 | 10 |
        And I fill the field A with the following data <integer>
        When I exit the field A
        Then I see a label message with an error
    
        Examples:
            | integer |
            | 0    |
            | 11   |

    #IntegerEditView -  A click on the label gives the focus to the input field
    #The label of the field and the input field are connected with the id and the for attributes so that a click on the label gives the focus to the input field.
    @javascript
    Scenario: Verify that a click on the label gives the focus to the input field
        Given I am logged in as "Anonymous"
        And I have a field A of type "IntegerEditView"
        And I have a label L with message M1
        When I click on label L
        Then I goto field A

    #IntegerEditView - Change the label when the user changes data
    #change when the user changes something
    @javascript
    Scenario: Change the label when the user changes data
        Given I am logged in as "Anonymous"
        And I have a field A of type "IntegerEditView"
        And I have a label L with message M1
        When I update the field A
        And I see a label L with message M2
        And message M2 is different from message M1
