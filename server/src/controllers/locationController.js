import supabase from "../utils/supabaseClient.js";

const getTableAndColumns = (type) => {
  const lowerType = type.toLowerCase();
  let tableName = "";
  let idColumn = "";
  let nameColumn = "";

  switch (lowerType) {
    case "rt":
      tableName = "rt";
      idColumn = "rt_id";
      nameColumn = "name";
      break;
    case "kelurahan":
      tableName = "kelurahan_desa";
      idColumn = "kelurahan_desa_id";
      nameColumn = "name";
      break;
    case "provinsi":
      tableName = "provinsi";
      idColumn = "provinsi_id";
      nameColumn = "name";
      break;
    case "kabupaten":
    case "kabupaten_kota":
      tableName = "kabupaten_kota";
      idColumn = "kabupaten_kota_id";
      nameColumn = "name";
      break;
    case "kecamatan":
      tableName = "kecamatan";
      idColumn = "kecamatan_id";
      nameColumn = "name";
      break;
    default:
      throw new Error("Invalid location type");
  }
  return { tableName, idColumn, nameColumn };
};

export const searchLocations = async (req, res, next) => {
  try {
    const { type, query } = req.query;
    if (!type || query.trim() === "") {
      return res
        .status(400)
        .json({ message: "Type and non-empty query parameter are required." });
    }
    let tableAndColumns;
    try {
      tableAndColumns = getTableAndColumns(type);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
    const { tableName, idColumn, nameColumn } = tableAndColumns;

    const { data, error } = await supabase
      .from(tableName)
      .select(`${idColumn}, ${nameColumn}`)
      .ilike(nameColumn, `%${query}%`)
      .limit(10);

    if (error) {
      return res
        .status(500)
        .json({ message: "Failed to search locations", detail: error.message });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const getLocationNames = async (req, res, next) => {
  try {
    const { type, provinsi_id, kabupaten_kota_id, kecamatan_id } = req.query;
    if (!type) {
      return res.status(400).json({ message: "Location type is required" });
    }
    let tableAndColumns;
    try {
      tableAndColumns = getTableAndColumns(type);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
    const { tableName, idColumn, nameColumn } = tableAndColumns;

    let queryBuilder = supabase
      .from(tableName)
      .select(`${idColumn}, ${nameColumn}`);
    if (tableName === "kabupaten_kota" && provinsi_id) {
      queryBuilder = queryBuilder.eq("provinsi_id", provinsi_id);
    }
    if (tableName === "kecamatan" && kabupaten_kota_id) {
      queryBuilder = queryBuilder.eq("kabupaten_kota_id", kabupaten_kota_id);
    }
    if (tableName === "kelurahan_desa" && kecamatan_id) {
      queryBuilder = queryBuilder.eq("kecamatan_id", kecamatan_id);
    }
    if (tableName === "rt" && req.query.kelurahan_desa_id) {
      queryBuilder = queryBuilder.eq(
        "kelurahan_desa_id",
        req.query.kelurahan_desa_id
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      return res.status(500).json({ message: error.message });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
};
