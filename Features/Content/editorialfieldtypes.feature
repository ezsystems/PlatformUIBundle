@editorial
Feature: Test the validations done on fields from Editorial Interface
    In order to use the Editorial fields
    As a user
    I want to validate the use of the fields data

    #https://confluence.ez.no/display/DEV/MapLocationEditView
    #https://confluence.ez.no/display/PR/n01+Basic+Edit+via+tree+navigation+-+explanations+-+fields+editing#n01BasicEditviatreenavigation-explanations-fieldsediting-MapLocation
    #maplocation - Validation using a valid maplocation
    #valid when the user input is valid when pressing "Find it" button
    @javascript @ezp-21729 @qa-232
    Scenario: Validate maplocation using a valid maplocation when pressing "Find it "button
        Given I am logged in as "Admin"
        And I have a "field A" of type "Maplocation"
        And "field A" is not mandatory
        And I am on "address_field" of "field A"
        And the "latitude" field of "field A" should contain ""
        And the "longitude" field of "field A" should contain ""
        And on "address_field" of "field A" I fill with "skien"
        When I click on "Find it" button
        Then I see no label message with an error
        And the "latitude" field of "field A" should contain "59.20986800000001"
        And the "longitude" field of "field A" should contain "9.609112200000027"

    #maplocation - valid when the user input is valid when pressing "Enter" key
    @javascript @ezp-21729 @qa-232
    Scenario: Validate maplocation using a valid maplocation when pressing "Enter" key
        Given I am logged in as "Admin"
        And I have a "field A" of type "Maplocation"
        And "field A" is not mandatory
        And I am on "address_field" of "field A"
        And the "latitude" field of "field A" should contain ""
        And the "longitude" field of "field A" should contain ""
        And on "address_field" I fill with "skien"
        When I press "Enter" key
        Then I see no label message with an error
        And the "latitude" field of "field A" should contain "59.20986800000001"
        And the "longitude" field of "field A" should contain "9.609112200000027"

    #maplocation - Validate maplocation using an invalid maplocation
    #check the input is a valid maplocation (this check is done only when the user leaves the input field)
    @javascript @ezp-21729 @qa-232
    Scenario Outline: Validate maplocation using an invalid maplocation
        Given I am logged in as "Admin"
        And I have a "field A" of type "Maplocation"
        And "field A" is not mandatory
        And I am on "address_field" of "field A"
        And the "latitude" field of "field A" should contain ""
        And the "longitude" field of "field A" should contain ""
        And on "address_field" I fill with <address_value>
        When I click on "Find it" button
        Then I see "Unable to find this address" error
        And the "latitude" field of "field A" should contain ""
        And the "longitude" field of "field A" should contain ""

        Examples: 
            | address_value |
            | blablabla     |
            |               |

    #maplocation - check whether the input is filled (if the field is set required)
    @javascript @ezp-21729 @qa-232
    Scenario: check whether the input is filled if the field is set required
        Given I am logged in as "Admin"
        And I have a "field A" of type "Maplocation"
        And "field A" is mandatory
        And I am on "address_field" of "field A"
        And on "address_field" of "field A" I fill with ""
        When I click on "Find address" button
        Then I see a label message with an error

    #maplocation - Like for the others field types, when the field is mandatory, a star is added right after the field name
    @javascript @ezp-21729 @qa-232
    Scenario: check whether the input is filled if the field is set required
        Given I am logged in as "Admin"
        And i have content type "B" with the following fields:
            | type        | name        | mandatory |
            | MapLocation | gmaps_value | true      |
        When I create a "Content A" of content type "B"
        Then I see a start after the "gmaps_value" field

    #maplocation - Select a point in the map
    @javascript @ezp-21729 @qa-232
    Scenario: Verify that is possible to select a point in the map
        Given I am logged in as "Admin"
        And I have a "field A" of type "Maplocation"
        And the "latitude" field of "field A" should contain ""
        And the "longitude" field of "field A" should contain ""
        When I select a point in the map #see how to implement this
        Then I see no label message with an error
        And the "latitude" field of "field A" should not contain ""
        And the "longitude" field of "field A" should not contain ""

    #maplocation - Use of "Locate me" button
    @javascript @ezp-21729 @qa-232
    Scenario: Verify the use of Locate Me button
        Given I am logged in as "Admin"
        And I have a "field A" of type "Maplocation"
        And the "latitude" field of "field A" should contain ""
        And the "longitude" field of "field A" should contain ""
        When I click on "Locate Me" button
        Then I see no label message with an error
        And the "latitude" field of "field A" should not contain ""
        And the "longitude" field of "field A" should not contain ""
