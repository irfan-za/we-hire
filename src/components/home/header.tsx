"use client";

import Link from "next/link";
import { ArrowLeft, MenuIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { UserData } from "@/types";
import { clearLocalStorageCache, getUserData } from "@/lib/utils/cache";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { usePathname, useSearchParams } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const externalId = searchParams.get("external_id");
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    setLoading(true);
    const checkAndFetchUser = async () => {
      const data = await getUserData();
      setUser(data);
      setLoading(false);
    };

    checkAndFetchUser();
  }, []);

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout");
      const data = await res.json();
      if (data.success) {
        await clearLocalStorageCache();
        window.location.reload();
        return "Successfully logged out";
      } else if (data.error) {
        throw new Error(data.error.message);
      }
    } catch (error) {
      throw error instanceof Error
        ? error.message
        : new Error("Failed to logout");
    }
  };

  return (
    <header className="bg-white sticky top-0 backdrop-blur w-full z-40 px-4">
      <div className="container flex h-15.5 items-center justify-between mx-auto">
        <div className="flex items-center gap-2">
          {pathname.startsWith("/jobs") ? (
            <Link href="/jobs" className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold">
                {externalId ? (
                  <span className="text-sm text-muted-foreground flex items-center hover:bg-muted border py-0.5 px-2 rounded-sm lg:hidden">
                    <ArrowLeft className="mr-1 w-4 h-4" /> back
                  </span>
                ) : (
                  <span className="lg:hidden inline">Job List</span>
                )}
                <span className="hidden lg:inline">Job List</span>
              </h2>
            </Link>
          ) : (
            <Link href="/" className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold text-teal-600">We Hire</h2>
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <div className="flex w-20 h-8 animate-pulse bg-gray-300 rounded-md"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 hover:bg-accent px-3 py-1 rounded-md cursor-pointer">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarFallback>
                        {user.full_name[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{user.full_name}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!pathname.startsWith("/jobs") && (
                    <>
                      <DropdownMenuItem className="p-0">
                        <Link href="/jobs" className="w-full h-full px-2 py-1">
                          All Jobs
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      toast.promise(logout(), {
                        loading: "Logging out...",
                        success: "Successfully logged out",
                        error: "Failed to logout",
                      });
                    }}
                    className="bg-red-700/70! text-primary-foreground!"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button className="font-medium" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 hover:bg-accent px-3 py-1 rounded-md cursor-pointer">
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback>{user.full_name[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                  <span>{user.full_name}</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!pathname.startsWith("/jobs") && (
                  <>
                    <DropdownMenuItem className="p-0">
                      <Link href="/jobs" className="w-full h-full px-2 py-1">
                        All Jobs
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    toast.promise(logout(), {
                      loading: "Logging out...",
                      success: "Successfully logged out",
                      error: "Failed to logout",
                    });
                  }}
                  className="bg-red-700/70! text-primary-foreground!"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
          <button
            className="rounded-md hover:bg-muted"
            onClick={toggleMenu}
            aria-label={"toggle menu"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-background border-b border-border py-4 shadow-lg">
          <div className="container space-y-4">
            <nav className="flex flex-col space-y-4 px-4">
              {user && (
                <Link
                  href="/jobs"
                  className="text-base font-medium p-2 hover:bg-muted rounded-md flex items-center"
                >
                  <span>All Jobs</span>
                </Link>
              )}

              {user && (
                <Button
                  onClick={() => {
                    toast.promise(logout(), {
                      loading: "Logging out...",
                      success: "Successfully logged out",
                      error: "Failed to logout",
                    });
                  }}
                  className="bg-red-700/70! text-primary-foreground!"
                >
                  Logout
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}
      <div className="w-full h-0.5 bg-muted"></div>
    </header>
  );
}
