import useTime from "@/hooks/useTime";
import Link from "next/link";

function MeetNav() {
    
  const { currentDateTime } = useTime();
    return (
        <div className='meet-nav'>
            <div className='meet-nav-logo'>
                <Link href="/" prefetch={false}>
                    <img
                        alt="telency-main-logo"
                        src="/assets/dashboard/logo.svg"
                    />
                </Link>
            </div>
            <div>
        {currentDateTime}
            </div>
        </div>
    )
}

export default MeetNav;