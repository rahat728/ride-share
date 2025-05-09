// components/CompletedRides.jsx
const CompletedRides = ({ rides }) => {
    if (rides.length === 0) {
      return <p className="text-gray-500">No completed rides yet.</p>;
    }
  
    return (
      <div className="space-y-4">
        {rides.map((ride) => (
          <div key={ride._id} className="p-4 border rounded-lg bg-gray-50">
            <p><strong>Pickup:</strong> {ride.rideRequest?.pickupLocation}</p>
            <p><strong>Dropoff:</strong> {ride.rideRequest?.dropoffLocation}</p>
            <p><strong>Status:</strong> <span className="text-blue-600 font-semibold">Completed</span></p>
            <p className="text-sm text-gray-400">Completed at: {new Date(ride.updatedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default CompletedRides;
  