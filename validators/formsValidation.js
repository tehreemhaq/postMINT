const z = require('zod')



const userRegistrationSchema = z.object({
     username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9._]+$/,
      "Username can only contain letters, numbers, dots and underscores"
    )
    .refine(
      val => !val.startsWith(".") && !val.startsWith("_"),
      "Username cannot start with . or _"
    )
    .refine(
      val => !val.endsWith(".") && !val.endsWith("_"),
      "Username cannot end with . or _"
    )
    .refine(
      val => !val.includes("..") && !val.includes("__"),
      "Username cannot contain consecutive dots or underscores"
    ),

email: z
  .string()
  .trim()
  .email("Invalid email format")
  .refine(email => {
    const domain = email.split("@")[1];
    const name = domain.split(".")[0];
    return name.length >= 2;
  }, "Please enter a valid email") ,


  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
})


const postCreationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(15, "Title is too short to be meaningful")
    .max(100, "Title is too long")
    .refine(
      val => /[a-zA-Z]/.test(val),
      "Title must contain readable text"
    ),

  content: z
    .string()
    .trim()
    .min(80, "Post content is too short")
    .max(500, "Post content is too long")
    .refine(
      val => /[a-zA-Z]/.test(val),
      "Content must contain readable text"
    )
});



module.exports= {
    userRegistrationSchema,
    postCreationSchema
}