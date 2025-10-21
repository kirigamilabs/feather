import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, HTMLMotionProps } from "framer-motion"

interface Action {
  type: string
  params: any
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        gradient: "bg-gradient-to-r from-primary via-secondary to-accent text-primary-foreground hover:opacity-90 shadow-lg",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border-2 border-primary text-primary hover:bg-primary/5",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        action: "bg-primary text-primary-foreground shadow-md hover:bg-primary/85 transition-all duration-200",
        subtle: "bg-muted text-foreground hover:bg-muted/80 shadow-sm",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonBaseProps = React.ButtonHTMLAttributes<HTMLButtonElement> & 
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    action?: Action
  }

type ButtonMotionProps = Omit<HTMLMotionProps<"button">, keyof ButtonBaseProps>

export type ButtonProps = ButtonBaseProps & {
  withAnimation?: boolean
  motionProps?: ButtonMotionProps
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, action, withAnimation = false, motionProps, ...props }, ref) => {
    if (withAnimation) {
      const motionButtonProps = {
        ref,
        className: buttonVariants({ 
          variant: action ? "action" : variant, 
          size, 
          className 
        }),
        ...motionProps
      } as const;
    
      return (
        <motion.button
          {...motionButtonProps}
          {...(props as {})}
        >
          {action ? action.type : props.children}
        </motion.button>
      );
    }

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }