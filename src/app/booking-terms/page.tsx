import { LegalPage, legalRobots } from '@/components/ui/LegalPage';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = {
  ...pageMetadata({
    title: 'Booking terms',
    description: `Booking terms and conditions for ${site.name} small-group journeys: deposit, payment schedule, cancellation and travel insurance.`,
    path: '/booking-terms',
  }),
  robots: legalRobots,
};

export default function BookingTermsPage() {
  return (
    <LegalPage
      title="Booking terms"
      intro={`The terms that apply when you book a place on a ${site.name} group journey.`}
      updated="October 2026"
      sections={[
        {
          heading: 'Making a booking',
          body: ['When a booking is confirmed, and who the contract is with.'],
        },
        {
          heading: 'Deposit',
          body: ['The deposit per person to hold a place, and when it becomes non-refundable.'],
        },
        {
          heading: 'Payment schedule',
          body: [
            'When the balance is due, accepted payment methods, and what happens if a payment is late.',
          ],
        },
        {
          heading: 'If you cancel',
          body: ['Cancellation charges by notice period before departure, and how to cancel.'],
        },
        {
          heading: 'If we cancel or change a journey',
          body: [
            `Minimum group size, changes to hotels or itinerary, and refunds or alternatives if a journey cannot run. Groups are limited to ${site.maxGuests} guests.`,
          ],
        },
        {
          heading: 'Travel insurance',
          body: ['That comprehensive travel insurance is required, and what it must cover.'],
        },
        {
          heading: 'Passports, visas and health',
          body: [
            'The traveller’s responsibility for documents, entry requirements and health advice.',
          ],
        },
        {
          heading: 'Our responsibility',
          body: ['What we are and are not responsible for, including third-party suppliers.'],
        },
        {
          heading: 'Seller of Travel registration',
          body: [
            site.sellerOfTravel
              ? `Seller of Travel registration number ${site.sellerOfTravel}.`
              : 'Registration numbers for the states that require them (being confirmed).',
          ],
        },
      ]}
    />
  );
}
