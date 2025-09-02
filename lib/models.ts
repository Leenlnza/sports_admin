export interface Book {
  _id?: string
  title: string
  author: string
  category: string
  available: boolean
  coverImage?: string
  createdAt?: Date
}

export interface Member {
  _id?: string
  name: string
  email: string
  phone: string
  password: string
  joinDate?: Date
}

// เปลี่ยน Loan เป็น borrowhistory
export interface BorrowHistory {
  _id?: string
  bookId: string
  memberId: string
  memberName: string
  bookTitle: string
  loanDate: Date
  dueDate: Date
  returnDate?: Date
  daysLoaned: number
  status: "active" | "returned" | "overdue"
}
