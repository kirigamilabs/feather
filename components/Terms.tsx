import { LegalSection, TERMS_OF_SERVICE } from '@/components/LegalContent';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-4xl mx-auto p-6 sm:p-10">
        <LegalSection 
          title="Terms of Service" 
          content={TERMS_OF_SERVICE}
          className="text-white"
        />
      </div>
    </div>
  );
}