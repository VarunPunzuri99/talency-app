import { getOrgByType, setToken } from '@/services/api.service';
import { useRouter } from 'next/router';
import styles from './index.module.scss';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useDebounce } from 'primereact/hooks';
import { InputText } from 'primereact/inputtext';
import ContactCard from '@/components/Card/ContactCard';
import TitleBar, { FilterBar } from '@/components/TitleBar';

export async function getServerSideProps({ req }) {
    try {
        setToken(req);
        const data = await getOrgByType('root-org', 1, 6)
        return {
            props: {
                initialData: data || [],
            }
        };
    } catch (error) {
        // console.error('Error fetching company data:', error.message);
        return {
            props: {
                initialData: [],
            }
        }
    }

}

export default function Contacts({initialData }) {
    const router = useRouter();
    const [data, setData] = useState(initialData || null);
    const [inputValue, debouncedValue, setInputValue] = useDebounce(null, 400);


    useEffect(() => {
        const fetchData = async () => {
            // let res = await api.searchAccount({
            //     page: 0,
            //     pagesize: limit,
            //     name: debouncedValue,
            // });

            // if (res?.content) {
            //     setData(res?.content);
            //     setPageDetails(res);
            // }
        };
        if (false && debouncedValue != null) {
            fetchData();
        }
    }, [debouncedValue]);

    return (
        <>
            <TitleBar title="Vendor Team">
                <Button
                    label="Add Contact"
                    onClick={() => router.push(`${router.asPath}/add`)}
                />
            </TitleBar>
            <FilterBar>
                <div className={styles.left_section}>
                    <label>Sort by:</label>
                    <Dropdown
                        value={''}
                        options={[]}
                        optionLabel="name"
                        placeholder={'Bulk Actions'}
                        // onChange={(e) => setSelectedSort(e.value)}
                    />
                </div>
                <div className={styles.right_section}>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={inputValue}
                            placeholder="Search"
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </span>
                    {/* <label>
                        {pageDetails?.pageable?.offset || 0} -{' '}
                        {pageDetails?.pageable?.offset + limit <
                        pageDetails?.totalElements
                            ? pageDetails?.pageable?.offset + limit
                            : pageDetails?.totalElements}{' '}
                        of {pageDetails?.totalElements}
                    </label> */}
                </div>
            </FilterBar>

            {/* <ContactCard
                data={data}
                setData={setData}
                link="/internals/vendor-team"
            /> */}
            {/* <Pagination data={pageDetails} callBack={paginationCallBack} /> */}
        </>
    );
}
