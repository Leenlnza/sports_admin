import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("lcc_sports_new") // ใช้ฐาน lcc_sports_new
    const users = await db.collection("users").find({}).toArray()

    return NextResponse.json(users)
  } catch (error) {
    console.error("GET /api/users error:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("lcc_sports_new") // ใช้ฐาน lcc_sports_new
    const body = await request.json()

    // ตรวจสอบ field จำเป็น
    if (!body.name || !body.email || !body.password || !body.grade || !body.branch) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newUser = {
      name: body.name,
      email: body.email,
      password: body.password, // ควร hash ก่อน insert
      grade: body.grade,
      branch: body.branch,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("users").insertOne(newUser)

    return NextResponse.json({ _id: result.insertedId, ...newUser })
  } catch (error) {
    console.error("POST /api/users error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
