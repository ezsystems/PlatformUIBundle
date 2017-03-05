@editorial @ezp-21649
Feature: Test the validations done on float field from Editorial Interface
    In order to use the Float field of class Y.eZ.FloatEditView
    As a user
    I want to validate the use of the Float field data

    #https://confluence.ez.no/display/DEV/float

    #valid when the user input is valid
    #check whether the input is filled (if the Field is set required)
    #check that the input is a float (done while typing)
    @javascript
    Scenario Outline: Validate float when exiting the field using valid data
        Given I am logged in as "Anonymous"
        And I have a field A of type "float"
        And field A is not mandatory
        When I fill the field A with the following <float>
        Then I see no label message with an error

        Examples:
            | float |
            | 3.15  |
            | -3.15 |
            | 3,15  |
            | -3,15 |
            | 0     |
            ||

    #check that the input is a float (done while typing)
    @javascript
    Scenario Outline: Validate float when exiting the field using invalid float
        Given I am logged in as "Anonymous"
        And I have a field A of type "float"
        And I fill the field A with the following <float>
        Then I see a label message with an error

        Examples:
            | float |
            | a     |

    #check whether the input is filled (if the Field is set required)
    @javascript
    Scenario Outline: Validate float when exiting the field using invalid float
        Given I am logged in as "Anonymous"
        And I have a field A of type "float"
        And I fill the field A with the following <float>
        And field A is mandatory
        When I exit the field A
        Then I see a label message with an error

        Examples:
            | float |
            ||

    #float - Valid values within defined range - within, equal to superior, equal to inferior
    #check that the float is in the correct range (if the field definition is configured with a min and/or max value)
    @javascript
    Scenario Outline: Create an object that has a float fieldtype filled with within range values 
        Given I am logged in as an admin user
        And I have a field A of type "float"
        And I defined an inferior and superior range for field A
            | 1 | 10 |
        And I fill the field A with the following data <float>
        When I exit the field A
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
    @javascript
    Scenario Outline: Create an object that has a float fieldtype filled with out of range values 
        Given I am logged in as an admin user
        And I have a field A of type "float"
        And I defined an inferior and superior range for field A
            | 1 | 10 |
        And I fill the field A with the following data <float>
        When I exit the field A
        Then I see a label message with an error

        Examples:
            | float |
            | 0     |
            | 11    |

    #float -  A click on the label gives the focus to the input field
    #The label of the field and the input field are connected with the id and the for attributes so that a click on the label gives the focus to the input field.
    @javascript
    Scenario: Verify that a click on the label gives the focus to the input field
        Given I am logged in as "Anonymous"
        And I have a field A of type "float"
        And I have a label L with message M1
        When I click on label L
        Then I goto field A
    
    #float - Change the label when the user changes something
    #change when the user changes something
    @javascript
    Scenario: Change the label when the user changes something
        Given I am logged in as "Anonymous"
        And I have a field A of type "float"
        And I have a label L with message M1
        When I update the field A
        And I see a label L with message M2
        And message M2 is different from message M1
