import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import {
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthData = {
  session: Session | null;
  user: any;
  loading: boolean;
  isSeeker: boolean;
};

type User = {
  email: string;
  name: string;
  role: string;
  user_id: string;
};

const AuthContext = createContext<AuthData>({
  session: null,
  loading: true,
  user: null,
  isSeeker: false,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      setSession(session);

      if (session) {
        const { data: userData, error: userDataError } = await supabase
          .from("User")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        if (userDataError) throw userDataError;
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      fetchSession();
      setSession(session);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, loading, user, isSeeker: user?.role === "seeker" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
