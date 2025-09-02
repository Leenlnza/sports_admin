import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("lcc_sports_new") // ใช้ฐาน lcc_sports_new

    const records = await db
      .collection("borrow_records")
      .find({})
      .toArray()

    return NextResponse.json(records)
  } catch (error) {
    console.error("GET /api/borrow_records error:", error)
    return NextResponse.json({ error: "Failed to fetch borrow records" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("lcc_sports_new")
    const body = await request.json()

    // ตรวจสอบ field ที่จำเป็น
    if (!body.userId || !body.equipmentId || !body.equipmentName || !body.borrowDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newRecord = {
      userId: body.userId,
      equipmentId: body.equipmentId,
      equipmentName: body.equipmentName,
      borrowDate: new Date(body.borrowDate),
      returnDate: body.returnDate ? new Date(body.returnDate) : null,
      status: body.status || "borrowed",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("borrow_records").insertOne(newRecord)
    const insertedRecord = await db.collection("borrow_records").findOne({ _id: result.insertedId })

    return NextResponse.json(insertedRecord)
  } catch (error) {
    console.error("POST /api/borrow_records error:", error)
    return NextResponse.json({ error: "Failed to create borrow record" }, { status: 500 })
  }
}
