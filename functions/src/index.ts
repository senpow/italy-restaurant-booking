import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// --- 1. Data Definitions (Reused from Frontend logic) ---
// We redefine them here to ensure backend has the exact same truth as frontend

interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  location: string;
}

const RESTAURANT_TABLES: Table[] = [
  { id: 1, tableNumber: 1, capacity: 3, location: "Fenster (Links)" },
  { id: 2, tableNumber: 2, capacity: 3, location: "Fenster (Rechts)" },
  { id: 3, tableNumber: 3, capacity: 2, location: "Intim / Ecke" },
  { id: 4, tableNumber: 4, capacity: 4, location: "Zentral" },
  { id: 5, tableNumber: 5, capacity: 6, location: "Familienbereich" },
  { id: 6, tableNumber: 6, capacity: 6, location: "Familienbereich" },
];

const TIME_SLOTS = [
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
];

// --- 2. Security Configuration ---
// API Key for Voice AI authentication
// 生产环境中应使用 Firebase 环境变量: functions.config().voice_ai.key
const VOICE_AI_API_KEY = "bella-vista-secure-voice-key-2025";

/**
 * API Key 验证中间件
 * 检查请求头中的 x-api-key 是否匹配
 */
const validateApiKey = (req: any, res: any): boolean => {
  const apiKey = req.get("x-api-key") || req.headers["x-api-key"];

  if (!apiKey || apiKey !== VOICE_AI_API_KEY) {
    functions.logger.warn("未授权的API访问尝试", {
      ip: req.ip,
      headers: req.headers
    });
    res.status(401).json({
      error: "未授权",
      message: "缺少或无效的API密钥。请在请求头中包含有效的x-api-key。"
    });
    return false;
  }

  return true;
};

// --- 3. Helper Functions ---

/**
 * 将时间字符串转换为分钟数（从00:00开始）
 * 例如："12:30" -> 750分钟
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * 检查两个时间段是否重叠
 * @param start1 第一个时间段开始时间（分钟）
 * @param end1 第一个时间段结束时间（分钟）
 * @param start2 第二个时间段开始时间（分钟）
 * @param end2 第二个时间段结束时间（分钟）
 */
const timeRangesOverlap = (
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean => {
  // 如果一个时间段在另一个之前结束，则不重叠
  return start1 < end2 && start2 < end1;
};

/**
 * 获取给定时间段内被占用的桌子号码
 * @param allReservations 所有预订记录
 * @param requestedTime 请求的开始时间（HH:mm）
 * @param duration 预订时长（分钟）
 */
const getBookedTablesForTimeRange = (
  allReservations: any[],
  requestedTime: string,
  duration: number = 120
): number[] => {
  const requestStart = timeToMinutes(requestedTime);
  const requestEnd = requestStart + duration;

  const bookedTables: number[] = [];

  for (const reservation of allReservations) {
    const resStart = timeToMinutes(reservation.timeSlot);
    const resEnd = resStart + (reservation.duration || 120);

    // 检查时间段是否重叠
    if (timeRangesOverlap(requestStart, requestEnd, resStart, resEnd)) {
      bookedTables.push(reservation.tableNumber);
    }
  }

  return bookedTables;
};

// Check if a specific slot has space for a party size
const checkSlotAvailability = (
  bookedTables: number[],
  partySize: number
): { available: boolean; availableTable?: number } => {
  // Filter tables that fit the party size
  const suitableTables = RESTAURANT_TABLES.filter(t => t.capacity >= partySize);

  // Sort by capacity ascending (to fill small tables first - efficient allocation)
  suitableTables.sort((a, b) => a.capacity - b.capacity);

  // Find first table that is NOT booked
  const freeTable = suitableTables.find(t => !bookedTables.includes(t.tableNumber));

  if (freeTable) {
    return { available: true, availableTable: freeTable.tableNumber };
  }
  return { available: false };
};

// --- 3. API Endpoints for Vapi / Retell ---

/**
 * Endpoint: checkAvailability
 * Method: POST
 * Body: { "date": "2025-11-20", "time": "18:00", "partySize": 2 }
 */
export const checkAvailability = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // API Key 验证
  if (!validateApiKey(req, res)) {
    return; // 验证失败，已发送401响应
  }

  try {
    const { date, time, partySize } = req.body;

    // 输入验证
    if (!date || !time || !partySize) {
      functions.logger.warn('缺少必需参数', { date, time, partySize });
      res.status(400).json({
        error: "缺少必需参数",
        message: "请提供日期、时间和人数信息。"
      });
      return;
    }

    // 验证日期格式 (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      functions.logger.warn('日期格式无效', { date });
      res.status(400).json({
        error: "日期格式无效",
        message: "请使用正确的日期格式，例如：2025-11-25"
      });
      return;
    }

    // 验证时间是否在营业时间内
    if (!TIME_SLOTS.includes(time)) {
      functions.logger.warn('时间不在营业时间内', { time });
      res.status(400).json({
        error: "时间不在营业时间内",
        message: `营业时间为：午餐 12:00-14:00，晚餐 18:00-20:30`
      });
      return;
    }

    const size = Number(partySize);

    // 验证人数
    if (isNaN(size) || size < 1 || size > 6) {
      functions.logger.warn('人数无效', { partySize });
      res.status(400).json({
        error: "人数无效",
        message: "我们接受1-6人的预订。"
      });
      return;
    }

    functions.logger.info('检查可用性', { date, time, partySize: size });

    // 1. Get ALL reservations for that date (Optimized: 1 DB read)
    const snapshot = await db.collection('reservations')
      .where('date', '==', date)
      .where('status', '==', 'confirmed')
      .get();

    const allReservations = snapshot.docs.map(doc => doc.data());

    // 2. Check the requested time slot (considering 120min duration and overlaps)
    const bookedTableNumbers = getBookedTablesForTimeRange(allReservations, time, 120);

    const result = checkSlotAvailability(bookedTableNumbers, size);

    if (result.available) {
      functions.logger.info('找到可用桌位', { date, time, partySize: size, tableNumber: result.availableTable });
      res.status(200).json({
        available: true,
        message: `好的，我们在${time}有位置，可以容纳${size}位客人。`
      });
      return;
    }

    // 3. If NOT available, find alternatives for the SAME day
    const alternatives: string[] = [];

    for (const slot of TIME_SLOTS) {
      if (slot === time) continue; // Skip the one we already checked

      // Use time overlap detection for alternative slots too
      const bookedAtSlot = getBookedTablesForTimeRange(allReservations, slot, 120);
      const slotCheck = checkSlotAvailability(bookedAtSlot, size);

      if (slotCheck.available) {
        alternatives.push(slot);
      }
    }

    if (alternatives.length > 0) {
      functions.logger.info('找到替代时间', { date, time, alternatives });
      res.status(200).json({
        available: false,
        alternatives: alternatives,
        message: `抱歉，${time}已经订满了，但我们在${alternatives.join('、')}还有空位。您看这些时间合适吗？`
      });
    } else {
      functions.logger.info('当天无可用时间', { date, partySize: size });
      res.status(200).json({
        available: false,
        alternatives: [],
        message: `非常抱歉，${date}当天所有时间段都已订满。您可以选择其他日期吗？`
      });
    }

  } catch (error) {
    functions.logger.error("检查可用性时出错", error);
    res.status(500).json({
      error: "服务器错误",
      message: "抱歉，系统暂时无法处理您的请求，请稍后再试。"
    });
  }
});

/**
 * Endpoint: createReservation
 * Method: POST
 * Body: { "date": "2025-11-20", "time": "18:00", "partySize": 4, "name": "Max", "phone": "+49..." }
 */
export const createReservation = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // API Key 验证
  if (!validateApiKey(req, res)) {
    return; // 验证失败，已发送401响应
  }

  try {
    const { date, time, partySize, name, phone, email } = req.body;

    // 输入验证
    if (!date || !time || !partySize || !name) {
      functions.logger.warn('缺少必需字段', { date, time, partySize, name });
      res.status(400).json({
        success: false,
        error: "缺少必需字段",
        message: "请提供日期、时间、人数和姓名信息。"
      });
      return;
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      functions.logger.warn('日期格式无效', { date });
      res.status(400).json({
        success: false,
        error: "日期格式无效",
        message: "请使用正确的日期格式。"
      });
      return;
    }

    // 验证时间
    if (!TIME_SLOTS.includes(time)) {
      functions.logger.warn('时间不在营业时间内', { time });
      res.status(400).json({
        success: false,
        error: "时间无效",
        message: "请选择有效的预订时间。"
      });
      return;
    }

    const size = Number(partySize);

    // 验证人数
    if (isNaN(size) || size < 1 || size > 6) {
      functions.logger.warn('人数无效', { partySize });
      res.status(400).json({
        success: false,
        error: "人数无效",
        message: "我们接受1-6人的预订。"
      });
      return;
    }

    // 验证姓名
    if (name.trim().length < 2) {
      functions.logger.warn('姓名太短', { name });
      res.status(400).json({
        success: false,
        error: "姓名无效",
        message: "请提供完整的姓名。"
      });
      return;
    }

    functions.logger.info('开始创建预订', { date, time, partySize: size, name });

    let reservationId = '';

    // Transaction to prevent race conditions (Double booking)
    await db.runTransaction(async (transaction) => {
      // 1. Query current reservations
      const snapshot = await transaction.get(
        db.collection('reservations')
          .where('date', '==', date)
          .where('timeSlot', '==', time)
          .where('status', '==', 'confirmed')
      );

      const bookedTableNumbers = snapshot.docs.map(doc => doc.data().tableNumber);

      // 2. Find a table
      const check = checkSlotAvailability(bookedTableNumbers, size);

      if (!check.available || !check.availableTable) {
        throw new Error("Table unavailable");
      }

      // 3. Create Reservation Document
      const newResRef = db.collection('reservations').doc();
      reservationId = newResRef.id;

      transaction.set(newResRef, {
        userId: "voice-ai-agent", // Placeholder ID for system bookings
        userName: name.trim(),
        userEmail: email || "voice-ai@placeholder.com",
        phoneNumber: phone || "未提供",
        tableNumber: check.availableTable,
        date: date,
        timeSlot: time,
        partySize: size,
        duration: 120,
        status: 'confirmed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        source: 'voice-ai' // Mark source
      });

      functions.logger.info('预订创建成功', {
        reservationId,
        tableNumber: check.availableTable,
        date,
        time,
        name
      });
    });

    // 格式化日期用于显示 (YYYY-MM-DD -> MM月DD日)
    const [, month, day] = date.split('-');
    const dateFormatted = `${parseInt(month)}月${parseInt(day)}日`;

    res.status(200).json({
      success: true,
      reservationId: reservationId,
      message: `预订成功！${name}先生/女士，您的预订已确认。${dateFormatted}${time}，${size}位。我们期待您的光临！`
    });

  } catch (error: any) {
    functions.logger.error("创建预订时出错", error);
    if (error.message === "Table unavailable") {
      res.status(409).json({
        success: false,
        message: "抱歉，该时间段已经订满了。请选择其他时间。"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "抱歉，系统暂时无法处理您的预订，请稍后再试。"
      });
    }
  }
});
