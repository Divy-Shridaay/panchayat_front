import { HStack, Button, IconButton, Text } from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@chakra-ui/icons";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}) {
if (!totalPages) return null;   // only hide if missing

  const getVisiblePages = () => {
    const pages = [];

    if (totalPages <= 7) {
      // Show all pages if total < 7
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let p = start; p <= end; p++) pages.push(p);

    if (currentPage < totalPages - 2) pages.push("...");

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <HStack spacing={2} justify="center" mt={8}>
      
      {/* First Page */}
      <IconButton
        aria-label="First page"
        icon={<ArrowLeftIcon />}
        isDisabled={currentPage === 1}
        onClick={() => onPageChange(1)}
        size="sm"
        colorScheme="green"
        variant="ghost"
        rounded="full"
      />

      {/* Prev */}
      <IconButton
        aria-label="Previous page"
        icon={<ChevronLeftIcon />}
        isDisabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        size="sm"
        colorScheme="green"
        variant="ghost"
        rounded="full"
      />

      {/* Page Numbers */}
      {visiblePages.map((p, i) =>
        p === "..." ? (
          <Text key={i} px={2} color="gray.500">
            ...
          </Text>
        ) : (
          <Button
            key={i}
            size="sm"
            rounded="full"
            variant={p === currentPage ? "solid" : "outline"}
            colorScheme="green"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        )
      )}

      {/* Next */}
      <IconButton
        aria-label="Next page"
        icon={<ChevronRightIcon />}
        isDisabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        size="sm"
        colorScheme="green"
        variant="ghost"
        rounded="full"
      />

      {/* Last Page */}
      <IconButton
        aria-label="Last page"
        icon={<ArrowRightIcon />}
        isDisabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
        size="sm"
        colorScheme="green"
        variant="ghost"
        rounded="full"
      />

    </HStack>
  );
}
