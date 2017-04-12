Feature: Storing and displaying Date, DateTime and Time in eZPlatform

    Scenario: Storing and displaying Dates
        Given my computer's locale is set to my "Paris/France"
        And I create Content with a Date Field

        When I view this Content
        Then the Date is displayed with the same value

        When my computer's locale is set to "America/New-York"
        And I view this Content
        Then the Date is displayed with the same value


    Scenario: Storing and displaying Time
        Given my computer's locale is set to my "Paris/France"
        And I create Content with a Time Field

        When I view this Content
        Then the time is displayed in the "Paris/France" timezone

        When my computer's locale is set to "America/New-York"
        And I view this Content
        #1?
        Then the time is displayed in the "America/New-York" timezone
        #or 2?
        Then the time is displayed in the "Paris/France" timezone

    Scenario: Storing and displaying DateTime
        Given my computer's locale is set to my "Paris/France"
        And I create Content with a DateTime Field

        When I view this Content
        Then the date and time is displayed in the "Paris/France" timezone

        When my computer's locale is set to "America/New-York"
        And I view this Content
        #1?
        Then the date and time is displayed in the "America/New-York" timezone
        #or 2?
        Then the date and time is displayed in the "Paris/France" timezone
