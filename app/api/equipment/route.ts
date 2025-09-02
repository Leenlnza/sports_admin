import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("lcc_sports_new")

    // ดึงข้อมูลอุปกรณ์ทั้งหมด
    const equipments = await db.collection("equipment").find({}).toArray()

    return NextResponse.json(equipments)
  } catch (error) {
    console.error("GET /api/equipment error:", error)
    return NextResponse.json({ error: "Failed to fetch equipment" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("lcc_sports_new")

    const body = await request.json()

    // ตรวจสอบ field ที่จำเป็น
    if (!body.name || !body.category || !body.total) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newEquipment = {
      name: body.name,
      category: body.category,
      description: body.description || "",
      total: body.total,
      available: body.available ?? body.total, // ถ้าไม่ส่ง available มา จะตั้งค่า = total
      imgURL: body.imgURL || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("equipment").insertOne(newEquipment)
    const insertedEquipment = await db.collection("equipment").findOne({ _id: result.insertedId })

    return NextResponse.json(insertedEquipment)
  } catch (error) {
    console.error("POST /api/equipment error:", error)
    return NextResponse.json({ error: "Failed to create equipment" }, { status: 500 })
  }
}
