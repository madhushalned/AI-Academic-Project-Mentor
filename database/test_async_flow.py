import asyncio
from models import Student
from async_students import insert_student, get_student

async def main():
    student = Student(
        student_id="23CSE8888",
        name="Async Test Student",
        email="async.test@example.com",
        skills={"python": "intermediate"}
    )
    await insert_student(student)
    result = await get_student("23CSE8888")
    print("Async insert/get successful:", result)

if __name__ == "__main__":
    asyncio.run(main())