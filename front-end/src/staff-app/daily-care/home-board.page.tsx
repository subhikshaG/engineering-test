import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "@material-ui/core/ButtonBase";
import Switch from "@material-ui/core/Switch";
import SearchIcon from "@mui/icons-material/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles";
import { Colors } from "shared/styles/colors";
import { CenteredContainer } from "shared/components/centered-container/centered-container.component";
import { Person } from "shared/models/person";
import { useApi } from "shared/hooks/use-api";
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component";
import {
  ActiveRollOverlay,
  ActiveRollAction
} from "staff-app/components/active-roll-overlay/active-roll-overlay.component";
import { RolllStateType } from "shared/models/roll"

export const HomeBoardPage: React.FC = () => {
  const initialFilterType = {
    sortName: "first_name",
    sortOrder: "ascending"
  };
  const [isRollMode, setIsRollMode] = useState(false);
  const [filterType, setFilterType] = useState(initialFilterType);
  const [nameChecked, setNameChecked] = useState(true);
  const [orderChecked, setOrderChecked] = useState(true);
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({
    url: "get-homeboard-students"
  });
  const [sortStudentList, setSortStudentList] = useState<Person[]>([]);
  const [currentRollState, setCurrentRollState] = useState(new Map());

  useEffect(() => {
    void getStudents();
  }, [getStudents]);

  useEffect(() => {
    if (data?.students) {
      setSortStudentList(data.students);
    }
    performSort("");
  }, [data?.students]);

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true);
    }
  };

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false);
    }
  };

  const performSort = (type: string) => {
    const studentList = data?.students;
    let orderedStudentList : Person[] = [];
    let toBeSortName = filterType?.sortName;
    let toBeSortOrder = filterType?.sortOrder;
    const filteredType = filterType;
    if (type === "nameSort") {
      if (filteredType?.sortName === "first_name") {
        toBeSortName = "last_name";
      } else {
        toBeSortName = "first_name";
      }
      filteredType.sortName = toBeSortName;
    } else if (type === "orderSort") {
      if (filteredType?.sortOrder === "ascending") {
        toBeSortOrder = "descending";
      } else {
        toBeSortOrder = "ascending";
      }
      filteredType.sortOrder = toBeSortOrder;
    }
    if (studentList && toBeSortOrder === "ascending" && toBeSortName === "first_name") {
      orderedStudentList = studentList?.sort((a, b) =>
        a?.first_name.localeCompare(b?.first_name)
      );
    } else if (studentList && toBeSortOrder === "ascending" && toBeSortName === "last_name") {
      orderedStudentList = studentList?.sort((a, b) =>
        a?.last_name.localeCompare(b?.last_name)
      );
    } else if (studentList && toBeSortOrder === "descending" && toBeSortName === "first_name") {
      orderedStudentList = studentList?.sort((a, b) =>
        b?.first_name.localeCompare(a?.first_name)
      );
    } else if (studentList) {
      orderedStudentList = studentList?.sort((a, b) =>
        b?.last_name.localeCompare(a?.last_name)
      );
    }

    setSortStudentList(orderedStudentList);
    setFilterType(filteredType);
  };

  const handleChange = (event: any, type: string) => {
    performSort(type);
    if (type === "nameSort") {
      setNameChecked(event?.target?.checked);
    } else {
      setOrderChecked(event?.target?.checked);
    }
  };

  const searchEvent = (event: any) => {
    const value = event?.target?.value;
    let filterStudents : Person[] = data?.students || [];
    performSort("");
    if (value && value?.length > 0 && filterStudents) {
      filterStudents = filterStudents?.filter((student) =>
        `${student?.first_name?.toLowerCase()} ${student?.last_name?.toLowerCase()}`.includes(
          value.toLowerCase()
        )
      );
    }
    setSortStudentList(filterStudents);
  };

  const updateRollState = (studentID: number, roll: string) => {
    if (studentID && roll) {
      setCurrentRollState((prev) => new Map(prev.set(studentID, roll)))
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar
          onItemClick={onToolbarAction}
          handleChange={handleChange}
          sortName={filterType?.sortName || ''}
          orderName={filterType?.sortOrder || ''}
          nameChecked={nameChecked}
          orderChecked={orderChecked}
          searchEvent={searchEvent}
        />
        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && sortStudentList && (
          <>
            {sortStudentList.map((s) => {
              const rollState : RolllStateType = currentRollState.get(s.id) || "unmark";
              return <StudentListTile key={s.id} isRollMode={isRollMode} rollState={rollState} student={s} setCurrentRollState={updateRollState}/>
            })}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay
        isActive={isRollMode}
        onItemClick={onActiveRollAction}
        currentRollState={currentRollState}
        totalStudents={data?.students?.length || 0}
      />
    </>
  );
};

type ToolbarAction = "roll" | "sort";
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void;
  handleChange: (event: any, type: string) => void;
  sortName: string;
  orderName: string;
  nameChecked: boolean;
  orderChecked: boolean;
  searchEvent: (event: any) => void;
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const {
    onItemClick,
    nameChecked,
    handleChange,
    sortName,
    orderName,
    orderChecked,
    searchEvent
  } = props;
  return (
    <S.ToolbarContainer>
      <div>{sortName === "first_name" ? "First Name" : "Last Name"}</div>
      <Switch
        checked={nameChecked}
        onChange={(event) => handleChange(event, "nameSort")}
        inputProps={{ "aria-label": "controlled" }}
      />
      <div>{orderName === "ascending" ? "Ascending" : "Descending"}</div>
      <Switch
        checked={orderChecked}
        onChange={(event) => handleChange(event, "orderSort")}
        inputProps={{ "aria-label": "controlled" }}
      />
      <input placeholder="Search" onChange={(event) => searchEvent(event)} />
      <SearchIcon />
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  );
};

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `
};
