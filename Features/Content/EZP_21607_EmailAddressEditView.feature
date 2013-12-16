@editorial @ezp-21607
Feature: Test the validations done on EmailAddressEditView field from Editorial Interface
In order to use the EmailAddressEditView field
As a user
I want to validate the use of the EmailAddressEditView field data

#https://confluence.ez.no/display/DEV/EmailAddressEditView
    
#EmailAddressEditView - Validation on exiting the field using a valid email
#check the input is a valid email (this check is done only when the user leaves the input field)
#valid when the user input is valid
#check whether the input is filled (if the field is set required)
Scenario Outline: Validate EmailAddressEditView when exiting the field using valid email
Given i am logged in as "Anonymous"
  And i have a field A of type "EmailAddressEditView"
  And field A is not mandatory
  And i fill the field A with the following data "<email>"
 When i exit the field A
 Then I see no label message with an error
Examples:
    | email              |
    | example.test@ez.no |
    ||

#EmailAddressEditView - Validation on exiting the field using an invalid email
#check the input is a valid email (this check is done only when the user leaves the input field)
#error when the user input is not valid
#check whether the input is filled (if the field is set required)
Scenario Outline: Validate EmailAddressEditView when exiting the field using invalid email
Given i am logged in as "Anonymous"
  And field A is mandatory
  And i have a field A of type "EmailAddressEditView"
  And i fill the field A with the following data "<email>"
 When i exit the field A
 Then I see a label message with an error
Examples:
    | email             |
    | ez.no@            |
    | ez.no             |
    | @#$<example>%     |
    | @ez.no            |
    ||

#EmailAddressEditView - Verify that no email validation is done when the user do not exit the EmailAddressEditView field
#check the input is a valid email (this check is done only when the user leaves the input field)
Scenario Outline: Verify that no email validation is done when the user do not exit the EmailAddressEditView field
Given i am logged in as "Anonymous"
  And i have a field A of type "EmailAddressEditView"
 When i fill the field A with the following data "<email>"
 Then I see no label message
Examples:
    | email              |
    | example.test@ez.no |
    | @ez.no             |

#EmailAddressEditView -  A click on the label gives the focus to the input field
#The label of the field and the input field are connected with the id and the for attributes so that a click on the label gives the focus to the input field.
Scenario: Verify that a click on the label gives the focus to the input field
Given i am logged in as "Anonymous"
  And i have a field A of type "EmailAddressEditView"
  And i have a label L with message M1
 When i click on label L
 Then i goto field A

#EmailAddressEditView - Change the label when the user changes something
#change when the user changes something
Scenario: Change the label when the user changes something
Given i am logged in as "Anonymous"
  And i have a field A of type "EmailAddressEditView"
  And i have a label L with message M1
 When i update the field A
  And i see a label L with message M2
  And message M2 is different from message M1