import { SignUp } from "@clerk/nextjs";

const CustomSignUp = () => {
  return (
    <div className="flex min-h-[80dvh] items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-primary hover:bg-primary/90 text-primary-foreground",
            card: "bg-background border border-border shadow-sm",
            headerTitle: "text-foreground",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "bg-background border border-border text-foreground hover:bg-accent",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-background border border-input text-foreground",
            footerActionLink: "text-primary hover:text-primary/90",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground"
          },
        }}
      />
    </div>
  );
};

export default CustomSignUp;