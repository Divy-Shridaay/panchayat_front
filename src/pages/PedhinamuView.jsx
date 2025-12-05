"use client";

import { useEffect, useState, useRef } from "react";
import {
    Box,
    Heading,
    Text,
    Button
} from "@chakra-ui/react";

import { FiChevronLeft } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoaderSpinner from "../components/LoaderSpinner";

import * as d3 from "d3";

/* -------------------------------------------------------
   CONVERT PEDHINAMU → HIERARCHICAL TREE
-------------------------------------------------------- */
function buildTreeData(pedhinamu) {

    function buildNode(person) {
        if (!person) return null;

        // Person node
        const personNode = {
            name: person.name,
            relation: person.relation || "",
            age: person.age || "",
            dobDisplay: person.dobDisplay || "",
            dodDisplay: person.dodDisplay || "",
            isDeceased: person.isDeceased || false,
            children: []
        };

        // Marriage wrapper node
        const marriageNode = {
            isMarriageNode: true,
            name: "marriage",
            children: []
        };

        // Attach marriage node to person
        personNode.children.push(marriageNode);

        // Spouse inside marriage node
        const spouse =
            person.spouse ||
            person.subFamily?.spouse;

        if (spouse?.name?.trim()) {
            marriageNode.children.push({
                name: spouse.name,
                relation: spouse.relation || "",
                age: spouse.age || "",
                dobDisplay: spouse.dobDisplay,
                dodDisplay: spouse.dodDisplay,
                isDeceased: spouse.isDeceased || false,
                children: []
            });
        }

        // Children INSIDE marriage node
        const kids =
            person.subFamily?.children ||
            person.children ||
            [];

        kids.forEach(child => {
            marriageNode.children.push(buildNode(child));
        });

        return personNode;
    }

    return buildNode({
        ...pedhinamu.mukhya,
        children: pedhinamu.heirs
    });
}


export default function PedhinamuView() {
    const { id } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const svgRef = useRef();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🟢 Persist zoom transform between renders
    const transformRef = useRef(null);

    function rel(key) {
        return t(key) || key;
    }

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/pedhinamu/${id}`);
            const json = await res.json();
            setData(json.pedhinamu);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    /* -------------------------------------------------------
        TREE RENDERING (APPLE / GOOGLE LEVEL)
    -------------------------------------------------------- */
    useEffect(() => {
        if (!data) return;

        const treeData = buildTreeData(data);


        const estimatedWidth = Math.max(1800, data.heirs.length * 350);
        const width = estimatedWidth;
        const height = 1500;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        svg.selectAll("*").remove();

        const container = svg.append("g");

        /* ----------------------------------------------
           PREMIUM GRADIENT
        ---------------------------------------------- */
        const defs = svg.append("defs");

        const gradient = defs.append("linearGradient")
            .attr("id", "appleGradient")
            .attr("x1", "0%")
            .attr("x2", "100%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#2F855A");

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#68D391");

        /* Drop shadow filter */
        const shadow = defs.append("filter")
            .attr("id", "softShadow")
            .attr("x", "-10%")
            .attr("y", "-10%")
            .attr("width", "200%")
            .attr("height", "200%");

        shadow.append("feDropShadow")
            .attr("dx", "0")
            .attr("dy", "3")
            .attr("stdDeviation", "4")
            .attr("flood-color", "#000")
            .attr("flood-opacity", "0.18");

        /* ----------------------------------------------
           ZOOM + PAN (PERSISTENT)
        ---------------------------------------------- */
        const zoom = d3.zoom()
            .scaleExtent([0.35, 2.8])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
                transformRef.current = event.transform; // SAVE ZOOM POS!
            });

        svg.call(zoom);

        /* ----------------------------------------------
           LAYOUT
        ---------------------------------------------- */
        const root = d3.hierarchy(treeData);
        const treeLayout = d3.tree().nodeSize([260, 180]);
        treeLayout(root);
        // 🔥 Remove vertical gap from marriage nodes
        root.descendants().forEach(d => {
            if (d.data.isMarriageNode) {
                d.y = d.parent.y; // keep marriage at same depth as parent
            }
        });

        /* ----------------------------------------------
   CONNECTORS (FIXED FOR MARRIAGE NODE)
---------------------------------------------- */
        container.selectAll(".link")
            .data(root.links())
            .enter()
            .append("path")
            .attr("d", (d) => {

                // If target is marriage node → draw slightly different
                const isMarriage = d.target.data.isMarriageNode;

                const startY = d.source.y + 60;
                const endY = isMarriage ? d.target.y - 20 : d.target.y - 60;

                return `
            M${d.source.x},${startY}
            C${d.source.x},${(d.source.y + d.target.y) / 2}
             ${d.target.x},${(d.source.y + d.target.y) / 2}
             ${d.target.x},${endY}
        `;
            })
            .attr("fill", "none")
            .attr("stroke", "url(#appleGradient)")
            .attr("stroke-width", 3)
            .attr("opacity", 0.9)
            .attr("filter", "url(#softShadow)");

        /* ----------------------------------------------
           NODES
        ---------------------------------------------- */
        const node = container
            .selectAll(".node")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("transform", (d) => `translate(${d.x - 90}, ${d.y - 55})`);

        node.filter(d => !d.data.isMarriageNode)
            .append("foreignObject")
            .attr("width", 200)
            .attr("height", 160)
            .style("overflow", "visible")
            .html((d) => `
                <div xmlns="http://www.w3.org/1999/xhtml"
                    style="
                        width:180px;
                        padding:14px;
                        border-radius:20px;
                        background:rgba(255,255,255,0.85);
                        border:1px solid #d7e8df;
                        backdrop-filter: blur(10px);
                        text-align:center;
                        box-shadow:0 6px 20px rgba(0,0,0,0.15);
                        transition:0.25s ease;
                    "
                    onmouseover="this.style.transform='translateY(-8px) scale(1.05)';
                                  this.style.boxShadow='0 12px 28px rgba(0,0,0,0.25)'"
                    onmouseout="this.style.transform='translateY(0) scale(1)';
                               this.style.boxShadow='0 6px 20px rgba(0,0,0,0.15)'"
                >
                    <div style="font-weight:900;color:#276749;font-size:20px;">
                        ${d.data.name}
                    </div>

                    <div style="color:#555;font-size:13px;margin-top:2px;">
                        ${rel(d.data.relation)}
                    </div>

                    ${d.data.isDeceased
                    ? `<div style="
                                margin-top:6px;
                                background:#e53e3e;
                                color:white;
                                padding:4px 9px;
                                border-radius:10px;
                                font-size:12px;
                            ">
                            ${t("deceased")}
                          </div>`
                    : ""
                }

                    <div style="margin-top:12px;color:#333;font-size:13px;line-height:1.4;">
                        <div>${t("age")}: ${d.data.age || "-"}</div>
                        <div>${t("birthDate")}: ${d.data.dobDisplay || "-"}</div>
                        ${d.data.isDeceased ? `<div>${t("deathDate")}: ${d.data.dodDisplay || "-"}</div>` : ""}
                    </div>
                </div>
            `);

        /* ----------------------------------------------
           AUTO-CENTER or RESTORE LAST CAMERA
        ---------------------------------------------- */
        const initialScale = 0.62;
        const centerX = width / 2 - root.x;

        if (transformRef.current) {
            // restore camera after scroll/refresh
            svg.call(zoom.transform, transformRef.current);
        } else {
            // first time render
            svg.call(
                zoom.transform,
                d3.zoomIdentity.translate(centerX, 70).scale(initialScale)
            );
        }
    }, [data]);

    /* ----------------------------------------------
       UI
    ---------------------------------------------- */

    if (loading) return <LoaderSpinner label={t("loading")} />;
    if (!data) return <Text>{t("noRecords")}</Text>;

    return (
        <Box minH="100vh" bg="#F5F8F6" px={10} py={8} overflow="hidden">

            {/* HEADER BAR */}
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bg="rgba(255,255,255,0.7)"
                backdropFilter="blur(10px)"
                border="1px solid #e2e8f0"
                px={6}
                py={4}
                rounded="2xl"
                shadow="sm"
                mb={8}
            >
                <Button
                    leftIcon={<FiChevronLeft />}
                    bg="green.600"
                    color="white"
                    _hover={{ bg: "green.700", transform: "translateX(-3px)" }}
                    _active={{ bg: "green.800" }}
                    rounded="xl"
                    shadow="xs"
                    onClick={() => navigate("/pedhinamu/list")}
                >
                    {t("back")}
                </Button>

                <Heading
                    color="green.700"
                    fontWeight="900"
                    fontSize="2.4rem"
                    letterSpacing="0.3px"
                >
                    {t("pedhinamu")}
                </Heading>

                <Box width="120px" />
            </Box>

            {/* MAIN TREE CONTAINER */}
            <Box
                bg="white"
                p={6}
                rounded="3xl"
                shadow="xl"
                border="1px solid #e2e8f0"
                maxW="100%"
                overflow="auto"
                height="85vh"
                transition="0.25s ease"
                _hover={{ shadow: "2xl" }}
            >
                <svg ref={svgRef}></svg>
            </Box>

        </Box>
    );
}
