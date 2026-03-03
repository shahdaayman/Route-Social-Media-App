export default function StatBox({ number, label }) {
  return (
    <div className="border border-blue-100 rounded-xl p-4 text-center bg-blue-50">
      <h4 className="text-blue-900 font-bold text-lg">{number}</h4>
      <p className="text-xs text-gray-600 mt-1">{label}</p>
    </div>
  );
}