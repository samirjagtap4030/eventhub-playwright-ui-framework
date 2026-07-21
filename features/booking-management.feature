Feature: Booking Management

    @regression
    Scenario Outline: View the bookings list
        Given a login to EventHub with "<email>" and "<password>"
        When I book <listQty> tickets on featured event 1 for customer "<custName>" with "<custEmail>" and "<custPhone>"
        And I book <listQty> tickets on featured event 2 for customer "<custName>" with "<custEmail>" and "<custPhone>"
        And I open the bookings list
        Then the bookings list shows all my created bookings with their details
        And the clear all bookings control is visible

        Examples:
            | email                  | password    | custName       | custEmail                  | custPhone      | listQty |
            | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | Samir Tester   | samir.tester@example.com   | +91 9876543210 | 1       |
            | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | Priya Verifier | priya.verifier@example.com | +91 9123456780 | 1       |

    @regression
    Scenario Outline: View booking detail page
        Given a login to EventHub with "<email>" and "<password>"
        When I book <detailQty> tickets on featured event <detailEventIndex> for customer "<custName>" with "<custEmail>" and "<custPhone>"
        And I open the booking detail page of my last booking
        Then the booking detail header shows the booking reference and event title
        And all booking detail sections are rendered
        And the customer details match the booking customer
        And the payment summary shows <detailQty> tickets
        And the refund, cancel and back actions are available

        Examples:
            | email                  | password    | custName       | custEmail                  | custPhone      | detailQty | detailEventIndex |
            | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | Samir Tester   | samir.tester@example.com   | +91 9876543210 | 2         | 0                |
            | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | Priya Verifier | priya.verifier@example.com | +91 9123456780 | 3         | 1                |

    @regression
    Scenario Outline: Cancel a single booking
        Given a login to EventHub with "<email>" and "<password>"
        When I book <cancelQty> tickets on featured event 0 for customer "<custName>" with "<custEmail>" and "<custPhone>"
        And I open the booking detail page of my last booking
        And I cancel the booking from its detail page
        Then the cancelled booking no longer appears in the bookings list

        Examples:
            | email                  | password    | custName       | custEmail                  | custPhone      | cancelQty |
            | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | Samir Tester   | samir.tester@example.com   | +91 9876543210 | 1         |
            | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | Priya Verifier | priya.verifier@example.com | +91 9123456780 | 1         |

    @regression
    Scenario Outline: Clear all bookings
        Given a login to EventHub with "<email>" and "<password>"
        When I create one booking on each of the featured events "<eventIndexes>" for customer "<custName>" with "<custEmail>" and "<custPhone>"
        And I open the bookings list
        Then the bookings list shows at least <bookingCount> bookings
        When I clear all bookings
        Then the bookings list shows the empty state

        Examples:
            | email                  | password    | custName       | custEmail                  | custPhone      | eventIndexes | bookingCount |
            | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | Samir Tester   | samir.tester@example.com   | +91 9876543210 | 0,1,2        | 3            |
            | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | Priya Verifier | priya.verifier@example.com | +91 9123456780 | 0,1,2        | 3            |

    @regression
    Scenario Outline: Static event per-user seat isolation
        Given a second user "<emailB>" with "<passwordB>" records the seat count of featured event 0
        And a login to EventHub with "<email>" and "<password>"
        When I book <isoQty> tickets on featured event 0 for customer "<custName>" with "<custEmail>" and "<custPhone>"
        Then both users are viewing the same featured event
        And the second user seat count is unchanged after reloading
        And I clear all my bookings to free the shared demo account's seats

        Examples:
            | email                  | password    | emailB                 | passwordB   | custName       | custEmail                  | custPhone      | isoQty |
            | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | Samir Tester   | samir.tester@example.com   | +91 9876543210 | 3      |
            | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | xxxxxxxxxxxxxxxxxxxx | xxxxxxxxxxx | Priya Verifier | priya.verifier@example.com | +91 9123456780 | 2      |
