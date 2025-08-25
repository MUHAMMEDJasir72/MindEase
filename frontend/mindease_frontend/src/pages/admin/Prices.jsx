import React, { useEffect, useState } from "react";
import { getTierPrices, updateTierPrices } from "../../api/admin";
import { Pencil, Save, X } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { showToast } from "../../utils/toast";

function Prices() {
  const [tierPrices, setTierPrices] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchTierPrices = async () => {
    try {
      const res = await getTierPrices();
      if (res.success) {
        setTierPrices(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch tier prices:", error);
      showToast("Failed to fetch tier prices", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTierPrices();
  }, []);

  const handleEdit = (index, tier) => {
    setEditIndex(index);
    setEditedData({ ...tier });
  };

  const handleCancel = () => {
    setEditIndex(null);
    setEditedData({});
  };

  const handleChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await updateTierPrices(editedData);

      if (res.success) {
        fetchTierPrices();
        setEditIndex(null);
        setEditedData({});
        showToast(res.message, "success");
      } else {
        showToast(res.error, "error");
      }
    } catch (error) {
      console.error("Failed to update tier prices:", error);
      showToast("Failed to update prices", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get tier display name
  const getTierName = (tierKey) => {
    const tierMap = {
      bronze: "Bronze",
      silver: "Silver",
      gold: "Gold",
      platinum: "Platinum",
    };
    return tierMap[tierKey] || tierKey;
  };

  // Function to get tier color classes
  const getTierColor = (tierKey) => {
    const colorMap = {
      bronze: {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-800",
        button: "bg-amber-600 hover:bg-amber-700",
        accent: "bg-amber-100",
      },
      silver: {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-800",
        button: "bg-gray-600 hover:bg-gray-700",
        accent: "bg-gray-100",
      },
      gold: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        button: "bg-yellow-600 hover:bg-yellow-700",
        accent: "bg-yellow-100",
      },
      platinum: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
        button: "bg-blue-600 hover:bg-blue-700",
        accent: "bg-blue-100",
      },
    };
    return colorMap[tierKey] || colorMap.bronze;
  };

  // Group prices by tier
  const groupedTiers = {};
  if (tierPrices.length > 0) {
    const tierData = tierPrices[0]; // Assuming there's only one configuration object

    Object.keys(tierData).forEach((key) => {
      if (key !== "id") {
        const [tier, service] = key.split("_");
        if (!groupedTiers[tier]) {
          groupedTiers[tier] = {};
        }
        groupedTiers[tier][service] = tierData[key];
      }
    });
  }

  if (isLoading && tierPrices.length === 0) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="ml-[220px] flex-1 bg-gray-50 min-h-screen p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#025c5e] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tier prices...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="ml-[220px] flex-1 bg-gray-50 min-h-screen p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tier Prices</h1>
          <p className="text-gray-600">Manage pricing for different service tiers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(groupedTiers).map((tierKey, index) => {
            const tierData = groupedTiers[tierKey];
            const colors = getTierColor(tierKey);
            const isEditing = editIndex === index;

            return (
              <div
                key={tierKey}
                className={`${colors.bg} ${colors.border} border-2 rounded-2xl shadow-sm overflow-hidden transition-all hover:shadow-md`}
              >
                {/* Tier Header */}
                <div className={`${colors.accent} px-6 py-4`}>
                  <h2
                    className={`${colors.text} text-xl font-semibold flex items-center justify-between`}
                  >
                    <span>{getTierName(tierKey)} Tier</span>
                  </h2>
                </div>

                {/* Tier Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {Object.keys(tierData).map((service) => {
                      const fieldName = `${tierKey}_${service}`;
                      const displayService =
                        service.charAt(0).toUpperCase() + service.slice(1);

                      return (
                        <div
                          key={fieldName}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-600">{displayService}</span>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">$</span>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editedData[fieldName] || ""}
                                onChange={(e) =>
                                  handleChange(
                                    fieldName,
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="border border-gray-300 px-2 py-1 rounded w-20 text-right"
                              />
                            ) : (
                              <span className="font-medium text-gray-800">
                                {tierData[service]}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className={`flex items-center gap-2 px-4 py-2 ${colors.button} text-white rounded-lg transition disabled:opacity-50`}
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save size={16} /> Save
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                          <X size={16} /> Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(index, tierPrices[0])}
                        className="flex items-center gap-2 px-4 py-2 bg-[#025c5e] text-white rounded-lg hover:bg-[#014445] transition"
                      >
                        <Pencil size={16} /> Edit Prices
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Prices;
