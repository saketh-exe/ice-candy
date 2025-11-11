import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import { Briefcase, Users, Building2 } from "lucide-react";

const Home = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold text-primary">
            Welcome to SkillSync
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Connecting talented students with amazing internship opportunities
          </p>

          <div className="mt-8 flex justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <Link to={`/${user?.role}/dashboard`}>
                <Button size="lg">Go to Dashboard</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold">For Students</h3>
              <p className="mt-2 text-muted-foreground">
                Create your profile, upload your resume, and browse thousands of
                internship opportunities tailored to your skills.
              </p>
            </Card>

            <Card className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold">For Companies</h3>
              <p className="mt-2 text-muted-foreground">
                Post internship opportunities, review applications, and find the
                perfect candidates for your team.
              </p>
            </Card>

            <Card className="text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="mt-4 text-xl font-semibold">Easy Matching</h3>
              <p className="mt-2 text-muted-foreground">
                Our platform makes it easy to connect the right students with
                the right opportunities through smart filtering.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">1000+</div>
              <div className="mt-2 text-muted-foreground">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">500+</div>
              <div className="mt-2 text-muted-foreground">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">2000+</div>
              <div className="mt-2 text-muted-foreground">
                Internships Posted
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
