import React, { useState, useEffect } from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Menu from "../components/menu"
import Position from "../components/position"
import SEO from "../components/seo"

const IndexPage = ({ data }) => {
  const [electionPositions, setElectionPositions] = useState([]);
  const [activePosition, setActivePosition] = useState("");
  const [positionCandidates, setPositionCandidates] = useState({});

  useEffect(() => {
    let electionPositionsUpdated = [];

    data.allCandidatesCsv.nodes.forEach((node) => {
      if (electionPositionsUpdated.indexOf(node.position) === -1) {
        electionPositionsUpdated.push(node.position);
      }

      // Replace newlines (carriage returns) in question responses with spaces
      data.allQuestionsJson.nodes.forEach((questionNode) => {
        node[questionNode.id] = node[questionNode.id].replace(/\r/g, " "); 
      })
    });

    setElectionPositions(electionPositionsUpdated);
    let initialPositionID = electionPositionsUpdated[0].replace(/ /g, '');
    setActivePosition(initialPositionID);

    let positionCandidatesNew = {};
    electionPositionsUpdated.map((position) => {
      console.log(position);
      // Construct a map of arrays for all candidates running for this position, with each array
      // containing the candidates running under a given party
      let matchingCandidates = {};
      data.allCandidatesCsv.nodes.forEach((node) => {
        if (node.position === position) {
          if (!(node.party in matchingCandidates)) {
            matchingCandidates[node.party] = [];
          }

          matchingCandidates[node.party].push(node);
        }
      });

      // Flatten the previously constructed map of arrays into a single array of candidates,
      // alternating between parties
      let matchingCandidatesArray = [];
      let i = 0;
      while (elementsRemaining(matchingCandidates, i)) {
        for (let party in matchingCandidates) {
          if (matchingCandidates[party].length > i) {
            matchingCandidatesArray.push(matchingCandidates[party][i]);
          }
        }

        i++;
      }

      positionCandidatesNew[position] = matchingCandidatesArray;
    });
    setPositionCandidates(positionCandidatesNew);
  }, [data]);

  function elementsRemaining(arrays, i) {
    for (let key in arrays) {
      if (arrays[key].length > i) {
        return true;
      }
    }

    return false;
  }

  return (
    <Layout location="/">
      <SEO title="Home" />

      <Menu positions={electionPositions} activePosition={activePosition} setActivePosition={setActivePosition} />

      <div className="content">
        <section className="candidates">
          {electionPositions.map((position) => {
            return (
              <Position key={position} title={position} candidates={positionCandidates[position]} questionData={data.allQuestionsJson.nodes}
                setActive={setActivePosition} />
            );
          })}
        </section>
      </div>
    </Layout>
  )
}

export default IndexPage

export const query = graphql`
query {
  allCandidatesCsv(filter: {Running_For: {ne: ""}}) {
    nodes {
      ...candidateFields
    }
  }

  allQuestionsJson {
    nodes {
      id
      question
    }
  }

  site {
    siteMetadata {
      title
    }
  }
}

fragment candidateFields on CandidatesCsv {
  id
  position: Running_For
  name: Name
  party: Party
  photo: Photo {
    childImageSharp {
      gatsbyImageData(
        width: 500,
        placeholder: BLURRED
      )
    }
  } 
  photoURL: Photo_URL
  pronouns: Pronouns
  interviewURL: Interview_URL
  year: Year
  major: Major
  BlurbP1
  BlurbP2
  Q1
  Q2
  Q3
  Q4
  Q5
  Q6
  Q7
  Q8
  Q9
  Q10
  Q11
  Q12
  Q13
  Q14
  Q15
  Q16
  Q17
  Q18
  Q19
}
`
